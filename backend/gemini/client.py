import os
import time
import logging
from typing import Any, Callable, List, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy singleton
_client = None
MOCK_MODE = not os.getenv("GEMINI_API_KEY")

# Models tried in order, all vision-capable (bill extraction needs image input).
#
# lite first for latency, 3.6-flash as the first fallback, flash-latest last
# because it is a moving alias that can drift between model generations.
#
# Deliberately excluded — dead on this project, verified live 2026-08-08:
#   gemini-2.0-flash            429 RESOURCE_EXHAUSTED, "limit: 0"
#   gemini-2.5-flash            404 "no longer available to new users"
#   gemini-2.5-flash-lite       404 "no longer available to new users"
# Listing them would only buy a wasted round-trip on every fallback.
GEMINI_MODEL_DEFAULT_PRIORITY = [
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest",
]

DEFAULT_MODEL = GEMINI_MODEL_DEFAULT_PRIORITY[0]
MODEL_NAME = os.getenv("GEMINI_MODEL") or DEFAULT_MODEL

# Model that actually served the most recent successful call, for meta.model.
_last_model_used: Optional[str] = None

if MOCK_MODE:
    print("\n" + "#" * 60)
    print("  LOUD WARNING: GEMINI_API_KEY IS NOT SET!")
    print("  GEMINI CLIENT RUNNING IN MOCK MODE. NO REAL CALLS WILL BE MADE.")
    print("#" * 60 + "\n")


def get_client() -> Optional[genai.Client]:
    global _client
    if MOCK_MODE:
        return None
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        _client = genai.Client(api_key=api_key)
    return _client


def model_priority() -> List[str]:
    """Configured model first, then the default priority, without duplicates.

    A GEMINI_MODEL override is prepended rather than replacing the list, so an
    override that turns out to be unavailable still falls back to known-good
    models instead of taking the whole service down.
    """
    ordered = [MODEL_NAME] + GEMINI_MODEL_DEFAULT_PRIORITY
    seen = set()
    result = []
    for m in ordered:
        if m and m not in seen:
            seen.add(m)
            result.append(m)
    return result


def get_last_model_used() -> str:
    """The model that served the last successful call (falls back to configured)."""
    return _last_model_used or MODEL_NAME


def thinking_config_for(model: str) -> Optional[types.ThinkingConfig]:
    """Minimise thinking — these models think by default and the extra latency
    is not acceptable for a live demo.

    The two generations take different knobs: 2.5 accepts thinking_budget=0,
    while 3.x rejects it with 400 INVALID_ARGUMENT and wants thinking_level.
    """
    if model.startswith("gemini-3") or "latest" in model:
        return types.ThinkingConfig(thinking_level="low")
    if "2.5" in model:
        return types.ThinkingConfig(thinking_budget=0)
    return None


def is_quota_error(e: Exception) -> bool:
    """True for 429 / RESOURCE_EXHAUSTED."""
    if isinstance(e, APIError) and getattr(e, "code", None) == 429:
        return True
    err_msg = str(e).lower()
    return "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg


def is_model_unavailable_error(e: Exception) -> bool:
    """True for 404 NOT_FOUND — model retired or not enabled for this key."""
    if isinstance(e, APIError) and getattr(e, "code", None) == 404:
        return True
    err_msg = str(e).lower()
    return "404" in err_msg or "not_found" in err_msg or "no longer available" in err_msg


def should_try_next_model(e: Exception) -> bool:
    """Both quota exhaustion and model-unavailability are per-model failures:
    the same request may well succeed on a different model."""
    return is_quota_error(e) or is_model_unavailable_error(e)


def generate(client, model: str, contents, response_schema=None):
    """One generate_content call, with thinking minimised for the given model.

    If the model rejects our thinking config (400 INVALID_ARGUMENT — the knob
    names differ across generations and aliases like gemini-flash-latest move),
    retry once without it rather than losing the model.
    """
    def build_config(with_thinking: bool):
        kwargs = {}
        if response_schema is not None:
            kwargs["response_mime_type"] = "application/json"
            kwargs["response_schema"] = response_schema
        if with_thinking:
            tc = thinking_config_for(model)
            if tc is not None:
                kwargs["thinking_config"] = tc
        return types.GenerateContentConfig(**kwargs) if kwargs else None

    try:
        return client.models.generate_content(
            model=model, contents=contents, config=build_config(True)
        )
    except Exception as e:
        if thinking_config_for(model) is not None and "invalid_argument" in str(e).lower():
            logger.warning(f"Model '{model}' rejected the thinking config ({e}). Retrying without it...")
            return client.models.generate_content(
                model=model, contents=contents, config=build_config(False)
            )
        raise


def call_with_retry(func, *args, **kwargs):
    """Executes the function with ONE retry on 5xx or timeouts. Never retries on 4xx."""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        err_msg = str(e).lower()
        is_retryable = False

        # Check if error is timeout or 5xx
        if "timeout" in err_msg or "deadline" in err_msg or "timed out" in err_msg:
            is_retryable = True
        elif isinstance(e, APIError):
            # APIError has code (HTTP status code) or message
            if e.code is not None and isinstance(e.code, int) and e.code >= 500:
                is_retryable = True
        else:
            # Fallback status check
            for code in ["500", "502", "503", "504"]:
                if code in err_msg:
                    is_retryable = True
                    break

        if is_retryable:
            logger.warning(f"Gemini API failed with retryable error: {e}. Retrying once...")
            time.sleep(1)
            return func(*args, **kwargs)
        else:
            raise e


def call_with_fallback(func: Callable[[str], Any], models: Optional[List[str]] = None) -> Any:
    """Calls func(model) against each model in priority order.

    On a 429 (quota) or 404 (model unavailable) the next model is tried; any
    other error is raised immediately, so a genuinely bad request fails fast
    instead of burning the whole list. 5xx and timeouts still get one retry per
    model. Records and logs whichever model actually served the request.
    """
    global _last_model_used
    candidates = models or model_priority()
    last_error: Optional[Exception] = None

    for model in candidates:
        try:
            result = call_with_retry(func, model)
        except Exception as e:
            if should_try_next_model(e):
                last_error = e
                logger.warning(f"Model '{model}' unavailable ({e}). Falling back to next model...")
                continue
            raise
        _last_model_used = model
        logger.info(f"Gemini request served by model '{model}'.")
        return result

    logger.error(f"All models exhausted: {candidates}")
    raise last_error if last_error else RuntimeError("No Gemini model available.")
