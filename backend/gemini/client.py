import os
import time
import logging
from typing import Optional
from google import genai
from google.genai.errors import APIError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy singleton
_client = None
MOCK_MODE = not os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.0-flash"

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
