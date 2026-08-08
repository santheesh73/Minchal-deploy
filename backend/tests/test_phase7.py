"""Phase 7 — model quota resilience.

The project has zero free-tier quota on some Gemini models (429
RESOURCE_EXHAUSTED, "limit: 0") even with a valid key, so a failure on the
configured model must fall back to the next one rather than kill the request.
"""
import os
import sys
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini import client as gclient
from gemini.client import (
    call_with_fallback,
    is_quota_error,
    is_model_unavailable_error,
    should_try_next_model,
    model_priority,
    get_last_model_used,
    thinking_config_for,
)

QUOTA_ERR = "429 RESOURCE_EXHAUSTED. {'error': {'message': 'quota exceeded', 'limit: 0'}}"
NOT_FOUND_ERR = "404 NOT_FOUND. {'error': {'message': 'This model is no longer available'}}"


def test_model_configurable_via_env():
    # GEMINI_MODEL drives the primary, otherwise DEFAULT_MODEL
    assert model_priority()[0] == gclient.MODEL_NAME
    prio = model_priority()
    assert len(prio) == len(set(prio)), "duplicate models would waste a round-trip"
    assert gclient.DEFAULT_MODEL in prio
    # more than one option, or there is nothing to fall back to
    assert len(prio) > 1


def test_is_quota_error():
    assert is_quota_error(Exception(QUOTA_ERR))
    assert is_quota_error(Exception("RESOURCE_EXHAUSTED"))
    assert not is_quota_error(Exception("400 INVALID_ARGUMENT"))
    assert not is_quota_error(Exception("503 unavailable"))


def test_is_model_unavailable_error():
    assert is_model_unavailable_error(Exception(NOT_FOUND_ERR))
    assert not is_model_unavailable_error(Exception("400 INVALID_ARGUMENT"))


def test_should_try_next_model_covers_both_failure_modes():
    # 429 (no quota) and 404 (model retired) are both per-model failures
    assert should_try_next_model(Exception(QUOTA_ERR))
    assert should_try_next_model(Exception(NOT_FOUND_ERR))
    assert not should_try_next_model(Exception("400 INVALID_ARGUMENT: bad image"))


def test_thinking_minimised_per_generation():
    # the two generations take different knobs; sending the wrong one is a 400
    # the SDK coerces the string to a ThinkingLevel enum
    assert str(thinking_config_for("gemini-3.6-flash").thinking_level).lower().endswith("low")
    assert str(thinking_config_for("gemini-3.1-flash-lite").thinking_level).lower().endswith("low")
    assert thinking_config_for("gemini-2.5-flash").thinking_budget == 0
    assert thinking_config_for("gemini-2.0-flash") is None


def test_fallback_triggers_on_404_too():
    def api_call(model):
        if model == "model-a":
            raise Exception(NOT_FOUND_ERR)
        return "ok"

    assert call_with_fallback(api_call, models=["model-a", "model-b"]) == "ok"
    assert get_last_model_used() == "model-b"


def test_generate_retries_without_thinking_config_on_400():
    # gemini-flash-latest aliases move between generations; a rejected thinking
    # config must not cost us the model
    from unittest.mock import MagicMock
    client = MagicMock()
    calls = []

    def side_effect(model, contents, config):
        calls.append(config)
        if len(calls) == 1:
            raise Exception("400 INVALID_ARGUMENT. Request contains an invalid argument.")
        return "ok"

    client.models.generate_content.side_effect = side_effect
    assert gclient.generate(client, "gemini-3.6-flash", "hi") == "ok"
    assert len(calls) == 2
    assert calls[0] is not None and calls[0].thinking_config is not None
    assert calls[1] is None or calls[1].thinking_config is None


def test_fallback_triggers_on_429_and_records_model():
    calls = []

    def api_call(model):
        calls.append(model)
        if model == "model-a":
            raise Exception(QUOTA_ERR)
        return f"served-by-{model}"

    result = call_with_fallback(api_call, models=["model-a", "model-b", "model-c"])

    assert result == "served-by-model-b"
    assert calls == ["model-a", "model-b"]  # stops at first success
    assert get_last_model_used() == "model-b"


def test_fallback_walks_the_whole_list():
    def api_call(model):
        if model != "model-c":
            raise Exception(QUOTA_ERR)
        return "ok"

    assert call_with_fallback(api_call, models=["model-a", "model-b", "model-c"]) == "ok"
    assert get_last_model_used() == "model-c"


def test_all_models_exhausted_raises():
    def api_call(model):
        raise Exception(QUOTA_ERR)

    with pytest.raises(Exception) as exc:
        call_with_fallback(api_call, models=["model-a", "model-b"])
    assert "RESOURCE_EXHAUSTED" in str(exc.value)


def test_non_quota_error_does_not_fall_back():
    calls = []

    def api_call(model):
        calls.append(model)
        raise Exception("400 INVALID_ARGUMENT: bad image")

    with pytest.raises(Exception) as exc:
        call_with_fallback(api_call, models=["model-a", "model-b"])
    assert "INVALID_ARGUMENT" in str(exc.value)
    assert calls == ["model-a"], "a 4xx must fail fast, not burn every model"


def test_analyze_meta_records_serving_model():
    # meta.model must be whichever model actually served, not a hardcoded string
    from fastapi.testclient import TestClient
    import json
    import main

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(base_dir, "mocks", "analyze_request.json"), encoding="utf-8") as f:
        payload = json.load(f)

    def fake_explain(*args, **kwargs):
        gclient._last_model_used = "gemini-2.5-flash-lite"
        return "விளக்கம்"

    with patch.object(main, "MOCK_MODE", False), \
         patch("gemini.explain.generate_explanation", side_effect=fake_explain):
        client = TestClient(main.app)
        res = client.post("/api/analyze", json=payload)

    assert res.status_code == 200, res.text
    assert res.json()["meta"]["model"] == "gemini-2.5-flash-lite"


def test_extraction_schema_is_all_optional():
    """The Gemini-facing schema must let the model say "not printed".

    backend/schemas.py is the locked frontend contract and stays required. If
    extraction reuses it as response_schema, a required float leaves the model
    no way to express absence — it emits 0, which reaches validate_bill as a
    genuine reading of zero and surfaces as INVALID_BILL instead of the correct
    OCR_MISSING_FIELD. Observed live on a real TNEB payment receipt.
    """
    from gemini.schemas import BillExtraction

    for name, field in BillExtraction.model_fields.items():
        assert not field.is_required(), f"BillExtraction.{name} must be optional"

    # a bill with nothing readable must parse, not explode
    assert BillExtraction().units_consumed is None


# Extraction-only control fields: present in the Gemini-facing schema, never in
# the locked response contract. Anything added here must be stripped by
# validate_bill before the payload reaches the frontend.
EXTRACTION_CONTROL_FIELDS = {"is_electricity_bill"}


def test_extraction_schema_matches_contract_field_names():
    # optional-ness may differ, field names may not — the contract is locked
    from gemini.schemas import BillExtraction
    from schemas import BillData

    assert set(BillExtraction.model_fields) - EXTRACTION_CONTROL_FIELDS == set(BillData.model_fields)


def test_control_fields_never_reach_the_response():
    """A control field leaking into the response would change the locked shape."""
    from gemini.validate import validate_bill

    out = validate_bill({
        "units_consumed": 620.0, "total_amount": 4800.0, "billing_days": 61,
        "is_electricity_bill": True,
    })
    for f in EXTRACTION_CONTROL_FIELDS:
        assert f not in out, f"{f} leaked into the response payload"


def test_absent_units_classified_as_missing_not_invalid():
    from gemini.validate import validate_bill, GeminiValidationError

    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": None, "total_amount": 1768.0, "billing_days": None})
    assert exc.value.reason == "OCR_MISSING_FIELD"


def test_dead_models_stay_out_of_priority():
    # 2.0-flash is 429 "limit: 0"; 2.5-flash and -lite are 404 retired
    prio = model_priority()
    for dead in ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"]:
        assert dead not in prio, f"{dead} is dead on this project and wastes a round-trip"


def test_priority_order_is_lite_first():
    assert gclient.GEMINI_MODEL_DEFAULT_PRIORITY == [
        "gemini-3.1-flash-lite",
        "gemini-3.6-flash",
        "gemini-flash-latest",
    ]


def test_env_override_still_falls_back_to_known_good():
    # an override that turns out to be unavailable must not take the service down
    with patch.object(gclient, "MODEL_NAME", "some-experimental-model"):
        prio = model_priority()
    assert prio[0] == "some-experimental-model"
    assert "gemini-3.1-flash-lite" in prio


def test_zero_units_is_unreadable_not_invalid():
    """A bare zero must not tell the user they uploaded the wrong document."""
    from gemini.validate import validate_bill, GeminiValidationError

    # bill-like: a total was read, only the units failed -> retake the photo
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 0, "total_amount": 1768.0, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"
    assert "clearer photo" in exc.value.message

    # null behaves identically to zero: same cause, same guidance
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": None, "total_amount": 1768.0, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"


def test_invalid_bill_reserved_for_no_bill_structure():
    """INVALID_BILL survives for images that are genuinely not bills."""
    from gemini.validate import validate_bill, GeminiValidationError

    for payload in (
        {"units_consumed": None, "total_amount": None, "billing_days": None},
        {"units_consumed": 0, "total_amount": 0, "billing_days": 0},
        {},
    ):
        with pytest.raises(GeminiValidationError) as exc:
            validate_bill(payload)
        assert exc.value.reason == "INVALID_BILL", payload

    # ...and for readings that are structurally impossible rather than unread
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 5001, "total_amount": 1000, "billing_days": 30})
    assert exc.value.reason == "INVALID_BILL"


def test_receipt_case_is_deterministic_across_both_model_outputs():
    """The real receipt flip-flopped between null and 0 between runs. Both must
    now produce the same user-facing error, or identical input gives different
    guidance on a coin flip."""
    from gemini.validate import validate_bill, GeminiValidationError

    reasons = set()
    for units in (None, 0, 0.0):
        with pytest.raises(GeminiValidationError) as exc:
            validate_bill({"units_consumed": units, "total_amount": 1768.0, "billing_days": None})
        reasons.add(exc.value.reason)
    assert reasons == {"OCR_MISSING_FIELD"}, f"non-deterministic guidance: {reasons}"
