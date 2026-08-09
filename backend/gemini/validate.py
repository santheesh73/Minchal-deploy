from typing import Any, Dict, Optional, Tuple

CURRENT_YEAR = 2026

# Implied-rate band (total_amount / units_consumed), in rupees per kWh.
# See the banded check in validate_bill for why the floor is not a single value.
GENERAL_RATE_FLOOR = 1.00
SUBSIDISED_RATE_FLOOR = 0.30
RATE_CEILING = 20.0

class GeminiValidationError(Exception):
    def __init__(self, reason: str, message: str):
        self.reason = reason
        self.message = message
        super().__init__(message)


def validate_bill(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validates bill extraction data. Raises GeminiValidationError for bill-level failures."""
    units = data.get("units_consumed")
    total = data.get("total_amount")
    days = data.get("billing_days")

    # 0a. Is this even a bill? Checked before anything numeric.
    #
    # A numeric gate can only judge plausibility, and a hallucination that lands
    # on plausible figures passes it: a blank grey rectangle returned 496 units
    # for Rs 1440 over 61 days, which is a perfectly reasonable bill. The model
    # has to say up front whether it is looking at a bill at all.
    #
    # Only an explicit False rejects. None means the field was not reported —
    # manual entry, older cached extractions — and must not block a real bill.
    if data.get("is_electricity_bill") is False:
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message=("This doesn't look like an electricity bill. Try again with a "
                     "clear photo of the bill, or use manual entry.")
        )

    # 0. structural check, before any per-field check.
    #
    # A single unreadable field means "couldn't read it" — retake the photo.
    # Nothing readable at all means there is no plausible bill structure here,
    # which is the one case where telling the user "this isn't a bill" is both
    # true and actionable. Keeping this separate is what stops a bare zero from
    # being mistaken for a wrong document.
    def _absent(v) -> bool:
        if v is None:
            return True
        try:
            return float(v) == 0
        except (ValueError, TypeError):
            return True

    if _absent(units) and _absent(total):
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message="This doesn't look like an electricity bill. Upload a photo of your TNEB bill."
        )

    # 1. units_consumed check
    if units is None:
        raise GeminiValidationError(
            reason="OCR_MISSING_FIELD",
            message="Couldn't read the units consumed. Try a clearer photo focusing on the reading details."
        )
    try:
        units_val = float(units)
    except (ValueError, TypeError):
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message="The extracted units consumed is invalid. Try taking another picture."
        )
    # Zero is "couldn't read it", not "not a bill". Gemini emits 0 when the
    # figure is unreadable, and a blurry photo of a real bill is a far more
    # likely failure than someone uploading the wrong document. The two errors
    # send the user somewhere completely different: INVALID_BILL tells them to
    # find another document, OCR_MISSING_FIELD tells them to retake the photo.
    #
    # INVALID_BILL stays reserved for images with no plausible bill structure
    # at all — see the total_amount check below, which escalates when NOTHING
    # bill-like was found rather than just this one field.
    if units_val == 0:
        raise GeminiValidationError(
            reason="OCR_MISSING_FIELD",
            message="Couldn't read the units consumed. Try a clearer photo focusing on the reading details."
        )
    if units_val < 0 or units_val > 5000:
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message="Units consumed is out of realistic ranges (0 to 5000 kWh). Make sure you uploaded the correct bill."
        )

    # 2. total_amount check
    if total is None:
        raise GeminiValidationError(
            reason="OCR_MISSING_FIELD",
            message="Couldn't read the total amount. Try a clearer photo of the final billing summary."
        )
    try:
        total_val = float(total)
    except (ValueError, TypeError):
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message="The extracted total amount is invalid. Try taking another picture."
        )
    if total_val <= 0:
        raise GeminiValidationError(
            reason="OCR_MISSING_FIELD",
            message="Billing amount is missing or invalid. Please check the photo."
        )

    # 3. billing_days check - default None to 60 (standard TNEB cycle), but validate explicit values
    if days is None:
        days_val = 60
    else:
        try:
            days_val = int(days)
        except (ValueError, TypeError):
            raise GeminiValidationError(
                reason="INVALID_BILL",
                message="The billing days count is invalid."
            )
        if days_val < 15 or days_val > 95:
            raise GeminiValidationError(
                reason="INVALID_BILL",
                message=f"Billing cycle days ({days_val}) is outside the supported range (15 to 95 days)."
            )

    # 4. implied rate check, banded.
    #
    # The floor was Rs 2.00/kWh, calibrated on unsubsidised assumptions. A real
    # photographed TANGEDCO bill (239 units, Rs 418 paid -> Rs 1.75/kWh) was
    # rejected as INVALID_BILL despite being extracted perfectly: Tamil Nadu
    # domestic tariffs with the 100-free-units scheme and subsidy legitimately
    # land below Rs 2. Telling a real customer "this isn't an electricity bill"
    # because their subsidy is working is the worst kind of wrong.
    #
    # The floor still has to catch garbage — a misread total that lands at
    # Rs 0.02/kWh is not a bill — so it is banded rather than removed:
    #   general                : Rs 1.00/kWh
    #   subsidy_applied > 0    : Rs 0.30/kWh
    # The Rs 20 ceiling is unchanged; that end was never the problem.
    subsidy = data.get("subsidy_applied")
    try:
        subsidised = subsidy is not None and float(subsidy) > 0
    except (ValueError, TypeError):
        subsidised = False
    rate_floor = SUBSIDISED_RATE_FLOOR if subsidised else GENERAL_RATE_FLOOR

    implied_rate = total_val / units_val
    if implied_rate < rate_floor or implied_rate > RATE_CEILING:
        raise GeminiValidationError(
            reason="INVALID_BILL",
            message=(f"Implied rate (Rs {implied_rate:.2f}/kWh) is outside the supported "
                     f"range (Rs {rate_floor:.2f} to Rs {RATE_CEILING:.2f}). "
                     "Ensure the bill details are clearly captured.")
        )

    # Convert values to correct types in validated output.
    # is_electricity_bill is a control field for this gate, not part of the
    # locked response contract — it must not reach the frontend.
    validated = {k: v for k, v in data.items() if k != "is_electricity_bill"}
    validated["units_consumed"] = units_val
    validated["total_amount"] = total_val
    validated["billing_days"] = days_val
    return validated


def validate_nameplate(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validates nameplate extraction data. Nulls invalid fields instead of raising error."""
    validated = dict(data)

    # 1. rated_power_w check
    power = data.get("rated_power_w")
    if power is not None:
        try:
            power_val = float(power)
            if power_val < 20.0 or power_val > 5000.0:
                validated["rated_power_w"] = None
            else:
                validated["rated_power_w"] = power_val
        except (ValueError, TypeError):
            validated["rated_power_w"] = None

    # 2. star_rating check
    star = data.get("star_rating")
    if star is not None:
        try:
            star_val = float(star)
            if star_val < 1.0 or star_val > 5.0:
                validated["star_rating"] = None
            else:
                validated["star_rating"] = star_val
        except (ValueError, TypeError):
            validated["star_rating"] = None

    # 3. manufacture_year check
    year = data.get("manufacture_year")
    if year is not None:
        try:
            year_val = int(year)
            if year_val < 1990 or year_val > CURRENT_YEAR:
                validated["manufacture_year"] = None
            else:
                validated["manufacture_year"] = year_val
        except (ValueError, TypeError):
            validated["manufacture_year"] = None

    return validated
