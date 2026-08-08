"""Phase 10 — fixes found by the first real photographed bill.

Both bugs here were invisible to every synthetic fixture: the rate floor was
calibrated to reject nothing we generated, and every generated fixture was
upright. A real handheld photo of a subsidised TANGEDCO bill found both.
"""
import io
import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini.validate import (
    validate_bill,
    GeminiValidationError,
    GENERAL_RATE_FLOOR,
    SUBSIDISED_RATE_FLOOR,
    RATE_CEILING,
)
from gemini import extract as gextract

def tiny_image_bytes(w=40, h=60):
    """A real decodable image - _rotate needs one, fake byte strings abort the
    rotation pass (correctly, see test_rotation_survives_an_undecodable_image)."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (w, h), "white").save(buf, format="JPEG")
    return buf.getvalue()


BILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "test-assets", "bills",
)

# ---------------------------------------------------------------------------
# Banded implied-rate floor
# ---------------------------------------------------------------------------

# The real bill, verified against the paper: 239 units printed as "Units: 239"
# (overprinted on the SAC code line), Rs 418 confirmed in words as "Four Hundred
# And Eighteen Only". Implied rate Rs 1.75/kWh. The old Rs 2.00 floor rejected
# this as INVALID_BILL - telling a real customer their subsidised bill was not
# an electricity bill. This case must never silently come back.
REAL_BILL_UNITS = 239.0
REAL_BILL_TOTAL = 418.0


def test_real_subsidised_bill_is_accepted():
    """REGRESSION: the exact numbers off the photographed TANGEDCO bill."""
    assert REAL_BILL_TOTAL / REAL_BILL_UNITS == pytest.approx(1.749, abs=0.01)

    out = validate_bill({
        "units_consumed": REAL_BILL_UNITS,
        "total_amount": REAL_BILL_TOTAL,
        "billing_days": 30,
    })
    assert out["units_consumed"] == REAL_BILL_UNITS
    assert out["total_amount"] == REAL_BILL_TOTAL


def test_real_subsidised_bill_accepted_with_subsidy_field_too():
    out = validate_bill({
        "units_consumed": REAL_BILL_UNITS,
        "total_amount": REAL_BILL_TOTAL,
        "billing_days": 61,
        "subsidy_applied": 7289.0,
    })
    assert out["billing_days"] == 61


def test_subsidy_unlocks_the_lower_band():
    # Rs 0.50/kWh: below the general floor, inside the subsidised band
    payload = {"units_consumed": 200.0, "total_amount": 100.0, "billing_days": 30}

    with pytest.raises(GeminiValidationError) as exc:
        validate_bill(dict(payload))
    assert exc.value.reason == "INVALID_BILL"

    out = validate_bill(dict(payload, subsidy_applied=500.0))
    assert out["total_amount"] == 100.0


def test_zero_or_absent_subsidy_does_not_unlock_the_band():
    payload = {"units_consumed": 200.0, "total_amount": 100.0, "billing_days": 30}
    for subsidy in (0, 0.0, None, "not a number"):
        with pytest.raises(GeminiValidationError):
            validate_bill(dict(payload, subsidy_applied=subsidy))


def test_floor_still_catches_garbage():
    """Lowering the floor must not let a misread total through as plausible."""
    # Rs 0.02/kWh - a misread total, not a bill, even with a subsidy present
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 1000.0, "total_amount": 20.0,
                       "billing_days": 30, "subsidy_applied": 500.0})
    assert exc.value.reason == "INVALID_BILL"


def test_ceiling_unchanged():
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 100.0, "total_amount": 50000.0, "billing_days": 30})
    assert exc.value.reason == "INVALID_BILL"
    assert RATE_CEILING == 20.0


def test_band_constants_are_ordered():
    assert 0 < SUBSIDISED_RATE_FLOOR < GENERAL_RATE_FLOOR < RATE_CEILING


def test_rate_error_message_is_ascii_safe():
    """The rupee sign crashed on the cp1252 Windows console when printed."""
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 1000.0, "total_amount": 20.0, "billing_days": 30})
    exc.value.message.encode("cp1252")  # must not raise


# ---------------------------------------------------------------------------
# Auto-rotation
# ---------------------------------------------------------------------------

def test_upright_photo_pays_no_extra_calls():
    """A correctly oriented photo must not cost 4x latency."""
    calls = []

    def run_once(data, mime):
        calls.append(mime)
        return {"units_consumed": 735.0, "total_amount": 5420.0}

    img = tiny_image_bytes()
    first = run_once(img, "image/png")
    best, deg = gextract._extract_best_orientation(img, "image/png", run_once, first)
    assert deg == 0
    assert len(calls) == 1, "no rotation retries should have been made"
    assert best["units_consumed"] == 735.0


def test_one_missing_field_DOES_trigger_rotation():
    """The real bug had exactly one required field missing: total_amount read
    fine at 418, units_consumed came back null. A both-missing threshold would
    never have fired on it."""
    first = {"units_consumed": None, "total_amount": 418.0}
    recovered = {"units_consumed": 239.0, "total_amount": 418.0}
    calls = []

    def run_once(data, mime):
        calls.append(mime)
        return recovered

    best, deg = gextract._extract_best_orientation(tiny_image_bytes(), "image/png", run_once, first)
    assert deg in gextract.ROTATIONS, "rotation must fire when units alone is missing"
    assert best == recovered
    assert calls, "at least one rotated retry should have been attempted"


def test_rotation_never_fires_when_both_required_fields_are_present():
    """The latency guard: a clean upright photo pays nothing extra."""
    first = {"units_consumed": 735.0, "total_amount": 5420.0, "billing_days": None}
    calls = []

    def run_once(data, mime):
        calls.append(mime)
        return first

    best, deg = gextract._extract_best_orientation(tiny_image_bytes(), "image/png", run_once, first)
    assert deg == 0
    assert calls == [], "missing billing_days alone must not trigger 3 extra API calls"


def test_rotation_recovers_a_sideways_photo():
    """The real failure: sideways, units_consumed came back null every time."""
    original = tiny_image_bytes()
    sideways = {"units_consumed": None, "total_amount": None}
    upright = {"units_consumed": 239.0, "total_amount": 418.0}
    seen = []

    def run_once(data, mime):
        seen.append(len(data))
        # rotated bytes differ from the original, standing in for orientation
        return upright if data != original else sideways

    best, deg = gextract._extract_best_orientation(original, "image/jpeg", run_once, sideways)
    assert best == upright
    assert deg in gextract.ROTATIONS
    assert len(seen) >= 1


def test_rotation_keeps_the_best_of_several_partial_reads():
    results = {
        90: {"units_consumed": None, "total_amount": 418.0},
        180: {"units_consumed": 239.0, "total_amount": 418.0, "billing_days": 30},
        270: {"units_consumed": 239.0, "total_amount": None},
    }
    order = []

    def run_once(data, mime):
        deg = gextract.ROTATIONS[len(order)]
        order.append(deg)
        return results[deg]

    first = {"units_consumed": None, "total_amount": None}
    best, deg = gextract._extract_best_orientation(tiny_image_bytes(), "image/jpeg", run_once, first)
    assert best["units_consumed"] == 239.0 and best["total_amount"] == 418.0
    assert deg == 180


def test_rotation_survives_an_undecodable_image():
    """A corrupt image must fail as extraction, not as a PIL traceback."""
    first = {"units_consumed": None, "total_amount": None}

    def run_once(data, mime):
        raise AssertionError("should not be reached - rotation could not decode")

    best, deg = gextract._extract_best_orientation(b"not-an-image", "image/jpeg", run_once, first)
    assert best == first
    assert deg == 0


def test_rotation_tolerates_a_failing_orientation():
    first = {"units_consumed": None, "total_amount": None}
    good = {"units_consumed": 239.0, "total_amount": 418.0}
    n = {"i": 0}

    def run_once(data, mime):
        n["i"] += 1
        if n["i"] == 1:
            raise RuntimeError("429 transient")
        return good

    best, deg = gextract._extract_best_orientation(tiny_image_bytes(), "image/jpeg", run_once, first)
    assert best == good


def test_rotate_produces_a_decodable_image():
    from PIL import Image
    src = os.path.join(BILLS_DIR, "synthetic_clean.png")
    if not os.path.isfile(src):
        pytest.skip("synthetic fixture missing")
    raw = open(src, "rb").read()
    out = gextract._rotate(raw, 90)
    im = Image.open(io.BytesIO(out))
    orig = Image.open(io.BytesIO(raw))
    assert (im.width, im.height) == (orig.height, orig.width), "90 deg must swap dimensions"


@pytest.mark.skipif(
    os.getenv("MINCHAL_LIVE_TESTS") != "1",
    reason="hits the real Gemini API; set MINCHAL_LIVE_TESTS=1 to run",
)
def test_live_rotated_fixture_still_extracts():
    """A 90-degree-rotated synthetic fixture must still extract correctly."""
    from dotenv import load_dotenv
    load_dotenv()
    import importlib
    import gemini.client as gclient
    importlib.reload(gclient)
    importlib.reload(gextract)

    raw = open(os.path.join(BILLS_DIR, "synthetic_clean.png"), "rb").read()
    rotated = gextract._rotate(raw, 90)
    out = gextract.extract_bill(rotated, "image/jpeg")
    assert out["units_consumed"] == 735.0
    assert out["total_amount"] == 5420.0


# ---------------------------------------------------------------------------
# Hallucination gate — a blank image passed as a valid bill
# ---------------------------------------------------------------------------

def test_blank_image_hallucination_is_rejected():
    """REGRESSION: a 400x300 flat grey canvas with no text on it produced
    "Bill Read Successfully - 496 kWh, Rs 1,440, 61 days, Verified" in the real
    UI. Fabricated values differed every run (150/348 on another), so no numeric
    gate can catch them: 1440/496 = Rs 2.90/kWh over 61 days is a perfectly
    plausible bill. Only the model saying up front that this is not a bill
    catches it."""
    from gemini.validate import validate_bill, GeminiValidationError

    hallucinated = {
        "is_electricity_bill": False,
        "units_consumed": 496.0,
        "total_amount": 1440.0,
        "billing_days": 61,
    }
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill(hallucinated)
    assert exc.value.reason == "INVALID_BILL"
    assert "manual entry" in exc.value.message.lower()


def test_hallucinated_values_would_otherwise_pass_every_numeric_check():
    """Proves the gate above is load-bearing: without the flag, those exact
    fabricated numbers sail through."""
    from gemini.validate import validate_bill

    out = validate_bill({"units_consumed": 496.0, "total_amount": 1440.0, "billing_days": 61})
    assert out["units_consumed"] == 496.0, "numeric checks alone cannot catch this"


def test_only_explicit_false_rejects():
    """None means 'not reported' — manual entry and older cached extractions
    have no such field and must not be blocked."""
    from gemini.validate import validate_bill

    for value in (True, None):
        out = validate_bill({
            "units_consumed": 620.0, "total_amount": 4800.0, "billing_days": 61,
            "is_electricity_bill": value,
        })
        assert out["units_consumed"] == 620.0

    # and a bill with the field absent entirely still works
    assert validate_bill({"units_consumed": 620.0, "total_amount": 4800.0, "billing_days": 61})


def test_not_a_bill_skips_rotation_retries():
    """No orientation turns a wall into a bill — don't spend 3 API calls."""
    calls = []

    def run_once(data, mime):
        calls.append(mime)
        return {}

    first = {"is_electricity_bill": False, "units_consumed": None, "total_amount": None}
    best, deg = gextract._extract_best_orientation(tiny_image_bytes(), "image/png", run_once, first)
    assert deg == 0
    assert calls == [], "rotation retries were spent on a non-bill"
