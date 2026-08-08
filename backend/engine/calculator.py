from typing import List, Tuple, Dict, Any, Optional
from engine.tables import (
    FRIDGE_KWH_DAY,
    DEFAULT_WATTS,
    HOURS_BAND,
    STAR_MULT,
    DUTY_CYCLE,
    DUTY_CYCLE_DEFAULT,
    AGE_PER_YEAR,
    CURRENT_YEAR,
    OTHER_SHARE,
    SYMPTOMS,
    TYPICAL_SHARE,
    LABELS,
    watts_key,
    symptom_multiplier
)

# Define custom error class matching specifications
class CalculatorError(Exception):
    def __init__(self, reason: str, message: str, status_code: int = 400):
        self.reason = reason
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def fault_factor(appliance_type: str, symptoms: List[str]) -> float:
    """MAX of matched multipliers, never product.
    Multiple symptoms usually share one root cause; multiplying them
    compounds overlapping effects into a number we cannot defend.
    Unknown keys are ignored, never raise. Empty list -> 1.0"""
    if not symptoms:
        return 1.0
    multipliers = []
    for symptom in symptoms:
        mult = symptom_multiplier(appliance_type, symptom)
        multipliers.append(mult)
    return max(multipliers) if multipliers else 1.0


def estimate_kwh(appliance: Any, days: int) -> Tuple[float, List[Dict[str, str]]]:
    """Returns (raw_kwh, working_steps).
    Build the working[] list DURING calculation, not by re-deriving after —
    the steps must be the actual arithmetic performed.

    Mode A (fridge): FRIDGE_KWH_DAY[star] * age_f * fault_f * days
        NOTE: STAR_MULT is NOT applied — star is already in FRIDGE_KWH_DAY.
    Mode B (all others):
        (watts/1000) * hours * duty * STAR_MULT[star] * age_f * fault_f * days

    age_f = 1 + AGE_PER_YEAR * max(0, CURRENT_YEAR - year)
    """
    # Standardize inputs whether dict or object
    if isinstance(appliance, dict):
        app_type = appliance.get("type")
        star = appliance.get("star")
        year = appliance.get("year")
        hours_band = appliance.get("hours_band")
        symptoms = appliance.get("symptoms") or []
        capacity = appliance.get("capacity")
        rated_power_w = appliance.get("rated_power_w")
    else:
        app_type = getattr(appliance, "type", None)
        star = getattr(appliance, "star", None)
        year = getattr(appliance, "year", None)
        hours_band = getattr(appliance, "hours_band", None)
        symptoms = getattr(appliance, "symptoms", None) or []
        capacity = getattr(appliance, "capacity", None)
        rated_power_w = getattr(appliance, "rated_power_w", None)

    if star is None:
        star = 3
    if year is None:
        year = CURRENT_YEAR


    # Clamp star rating [1, 5]
    star = max(1, min(5, int(star)))

    # Age calculation
    age = max(0, CURRENT_YEAR - int(year))
    age_f = 1.0 + AGE_PER_YEAR * age

    # Fault factor
    fault_f = fault_factor(app_type, symptoms)

    working_steps = []

    if app_type == "fridge":
        base_kwh_day = FRIDGE_KWH_DAY.get(star, 1.2)
        raw_kwh = base_kwh_day * age_f * fault_f * days
        
        working_steps.extend([
            {"label": "Mode", "value": "Continuous (Mode A)"},
            {"label": "Star Rating Base", "value": f"{base_kwh_day:.2f} kWh/day ({star}-star)"},
            {"label": "Age Factor", "value": f"{age_f:.3f} ({age} years old)"},
            {"label": "Symptom Multiplier", "value": f"{fault_f:.2f}"},
            {"label": "Raw Estimate", "value": f"{raw_kwh:.2f} kWh"}
        ])
    else:
        # Determine load. A custom appliance has no catalogue entry, so the
        # user's own rated_power_w is the only legitimate source — there is no
        # honest default for a device we have never heard of. estimate_kwh is
        # only reached after analyze() has already rejected a custom appliance
        # without one, so this is belt and braces.
        if app_type == "custom":
            if rated_power_w is None:
                raise CalculatorError(
                    reason="APPLIANCE_UNKNOWN",
                    message="A custom appliance needs its wattage. Enter it, or scan the nameplate.",
                    status_code=400,
                )
            watts = float(rated_power_w)
        else:
            w_key = watts_key(app_type, capacity)
            watts = DEFAULT_WATTS.get(w_key, 100)
        
        # Determine hours
        if hours_band is None:
            hours = 5.0
            hours_val_str = "5.0 hours (default)"
        else:
            hours = HOURS_BAND.get(hours_band, 5.0)
            hours_val_str = f"{hours:.1f} hours ({hours_band} band)"
            
        duty = DUTY_CYCLE.get(app_type, DUTY_CYCLE_DEFAULT)
        star_f = STAR_MULT.get(star, 1.0)
        raw_kwh = (watts / 1000.0) * hours * duty * star_f * age_f * fault_f * days

        working_steps.extend([
            {"label": "Rated Power", "value": f"{watts} W"},
            {"label": "Daily Hours (Banded)", "value": hours_val_str},
            {"label": "Duty Cycle", "value": f"{duty:.2f}"},
            {"label": "Star Rating Multiplier", "value": f"{star_f:.2f} ({star}-star)"},
            {"label": "Age Factor", "value": f"{age_f:.3f} ({age} years old)"},
            {"label": "Symptom Multiplier", "value": f"{fault_f:.2f}"},
            {"label": "Raw Estimate", "value": f"{raw_kwh:.2f} kWh"}
        ])

    return raw_kwh, working_steps


def build_assumptions(appliance: Any) -> List[Dict[str, Any]]:
    """ok=False when a value was defaulted rather than provided.
    At minimum: runtime entered vs assumed, nameplate read vs picker default,
    symptoms reported vs none asked."""
    if isinstance(appliance, dict):
        app_type = appliance.get("type")
        hours_band = appliance.get("hours_band")
        capacity = appliance.get("capacity")
        symptoms = appliance.get("symptoms") or []
    else:
        app_type = getattr(appliance, "type", None)
        hours_band = getattr(appliance, "hours_band", None)
        capacity = getattr(appliance, "capacity", None)
        symptoms = getattr(appliance, "symptoms", None) or []


    assumptions = []

    # Runtime check (only relevant for Mode B on-demand appliances)
    if app_type != "fridge":
        if hours_band is None:
            assumptions.append({
                "ok": False,
                "text": "பயன்பாட்டு நேரம் குறிப்பிடப்படவில்லை; சராசரியாக 4-6 மணிநேரம் கொள்ளப்பட்டது."
            })
        else:
            assumptions.append({
                "ok": True,
                "text": f"பயன்பாட்டு நேரம்: {hours_band} மணிநேரம்."
            })

    # Capacity nameplate check
    if capacity is None:
        assumptions.append({
            "ok": False,
            "text": "சாதனத்தின் திறன் இயல்புநிலை மதிப்பாகக் கொள்ளப்பட்டது."
        })
    else:
        assumptions.append({
            "ok": True,
            "text": f"சாதனத்தின் திறன் ({capacity}) லேபிளிலிருந்து பெறப்பட்டது."
        })

    # Symptoms check
    if not symptoms:
        assumptions.append({
            "ok": True,
            "text": "சாதனத்தில் பழுதுகள் ஏதும் கண்டறியப்படவில்லை."
        })
    else:
        assumptions.append({
            "ok": False,
            "text": f"{len(symptoms)} பழுது அறிகுறிகள் கணக்கில் கொள்ளப்பட்டன."
        })

    return assumptions


RUNTIME_ASSUMED_FLOOR = 0.60


def confidence(bill: Any, appliances: List[Any], scale: float) -> Tuple[int, List[Dict[str, Any]]]:
    """ocr     = non-null bill fields / expected fields
       runtime = 0.60 .. 1.00, by the fraction of appliances whose runtime the
                 user CONFIRMED (runtime_confirmed=True), not merely those with
                 a value present — the frontend pre-fills a default on add.
                 (fridges do not need one — exclude from denominator)
       scale_q = 1.0 if 0.85 <= scale <= 1.15
                 0.7 if 0.70 <= scale <= 1.40
                 0.4 otherwise
       percent = round(ocr * runtime * scale_q * 100)
    Returns (percent, exactly three Assumption ticks)."""
    # 1. OCR completeness
    fields = ["units_consumed", "total_amount", "billing_days", "period_end", "tariff_slab"]
    non_null_fields = 0
    for field in fields:
        val = getattr(bill, field, None)
        if val is None and isinstance(bill, dict):
            val = bill.get(field)
        if val is not None:
            non_null_fields += 1
    ocr = non_null_fields / len(fields)

    # 2. Runtime completeness (Mode B only)
    #
    # Counts runtime the USER confirmed, not merely a value that happens to be
    # present. The frontend pre-fills a per-appliance default on add, so
    # "hours_band is not None" was always true and this term was always 1.0 —
    # confidence read 100% on a path where nothing had been confirmed, and the
    # "runtime entered, not assumed" tick claimed the opposite of the truth.
    #
    # runtime_confirmed=None (absent) means not confirmed, never an assertion.
    # A supplied hours_band still improves the ESTIMATE; it just no longer
    # inflates the CONFIDENCE. Those are different claims and were conflated.
    mode_b_total = 0
    mode_b_filled = 0
    for app in appliances:
        if isinstance(app, dict):
            app_type = app.get("type")
            hours_band = app.get("hours_band")
            confirmed = app.get("runtime_confirmed")
        else:
            app_type = getattr(app, "type", None)
            hours_band = getattr(app, "hours_band", None)
            confirmed = getattr(app, "runtime_confirmed", None)

        if app_type != "fridge":
            mode_b_total += 1
            if hours_band is not None and confirmed is True:
                mode_b_filled += 1
    confirmed_fraction = (mode_b_filled / mode_b_total) if mode_b_total > 0 else 1.0

    # The terms multiply, so a raw 0/1 fraction would drive confidence to 0%
    # the moment nothing is confirmed — and 0% is as wrong as the old 100%.
    # Assumed runtime is not no information: the per-appliance defaults are
    # reasonable, and every estimate is still normalised against the real bill
    # total, which is the strongest signal we have. So assumed runtime floors
    # this term rather than zeroing it, and confirming appliances walks it up.
    #   nothing confirmed -> 0.60      all confirmed -> 1.00
    runtime = RUNTIME_ASSUMED_FLOOR + (1.0 - RUNTIME_ASSUMED_FLOOR) * confirmed_fraction

    # 3. Scale quality
    if 0.85 <= scale <= 1.15:
        scale_q = 1.0
    elif 0.70 <= scale <= 1.40:
        scale_q = 0.7
    else:
        scale_q = 0.4

    if not appliances:
        percent = 30
    else:
        percent = round(ocr * runtime * scale_q * 100)
        
    # Clamp confidence percent [0, 100]
    percent = max(0, min(100, percent))


    reasons = [
        {
            "ok": ocr >= 1.0,
            "text": "கட்டண விவரங்கள் முழுமையாகப் படிக்கப்பட்டுள்ளன." if ocr >= 1.0 else "கட்டண விவரங்கள் முழுமையற்றவை."
        },
        {
            "ok": runtime >= 1.0,
            "text": "அனைத்து சாதனங்களின் பயன்பாட்டு நேரம் குறிப்பிடப்பட்டுள்ளது." if runtime >= 1.0 else "சில சாதனங்களின் பயன்பாட்டு நேரம் யூகிக்கப்பட்டுள்ளது."
        },
        {
            "ok": 0.85 <= scale <= 1.15,
            "text": "மின் நுகர்வு கணக்கீடு மற்றும் கட்டணம் சரியாகப் பொருந்துகின்றன." if 0.85 <= scale <= 1.15 else "மின் நுகர்வு மற்றும் கட்டண விவரங்களில் முரண்பாடுகள் உள்ளன."
        }
    ]

    return percent, reasons


def analyze(bill: Any, appliances: List[Any]) -> Dict[str, Any]:
    """1. raw estimate per appliance (with working steps)
       2. other_raw = OTHER_SHARE * bill.units_consumed
       3. total = sum(raw) + other_raw
       4. scale = bill.units_consumed / total          <- THE ANCHOR
       5. multiply every value by scale, append the normalisation step
          to each appliance's working[]
       6. rate = total_amount / units_consumed; rupees = units * rate
       7. rank by rupees desc; 'other' always ranks last regardless
       8. percent = round(units / units_consumed * 100)
    Returns breakdown, scale_factor, and per-appliance working[]/assumptions[]."""
    # Extract bill inputs safely
    units_consumed = getattr(bill, "units_consumed", None)
    if units_consumed is None and isinstance(bill, dict):
        units_consumed = bill.get("units_consumed")
        
    total_amount = getattr(bill, "total_amount", None)
    if total_amount is None and isinstance(bill, dict):
        total_amount = bill.get("total_amount")

    billing_days = getattr(bill, "billing_days", None)
    if billing_days is None and isinstance(bill, dict):
        billing_days = bill.get("billing_days")

    if units_consumed is None or units_consumed <= 0:
        raise CalculatorError(
            reason="INVALID_BILL",
            message="Units consumed must be present and greater than 0.",
            status_code=400
        )

    rate = total_amount / units_consumed

    # If no appliances, return fallback breakdown consisting of other only
    if not appliances:
        other_item = {
            "type": "other",
            "label": LABELS["other"],
            "units": float(units_consumed),
            "rupees": float(total_amount),
            "percent": 100.0,
            "rank": 1
        }
        conf_pct, conf_reasons = confidence(bill, [], 1.0)
        return {
            "bill_total_rupees": float(total_amount),
            "breakdown": [other_item],
            "scale_factor": 1.0,
            "confidence_percent": float(conf_pct),
            "confidence_reasons": conf_reasons
        }

    # Validate appliance types
    for app in appliances:
        if isinstance(app, dict):
            app_type = app.get("type")
        else:
            app_type = getattr(app, "type", None)
        if app_type not in LABELS or app_type == "other":
            raise CalculatorError(
                reason="APPLIANCE_UNKNOWN",
                message=f"Unknown appliance type: {app_type}",
                status_code=400
            )
        if app_type == "custom":
            watts = app.get("rated_power_w") if isinstance(app, dict) else getattr(app, "rated_power_w", None)
            if watts is None or float(watts) <= 0:
                raise CalculatorError(
                    reason="APPLIANCE_UNKNOWN",
                    message="A custom appliance needs its wattage. Enter it, or scan the nameplate.",
                    status_code=400,
                )

    # 1. Raw estimates
    raw_estimates = {}
    for app in appliances:
        if isinstance(app, dict):
            app_id = app.get("id")
        else:
            app_id = getattr(app, "id", None)
        raw_val, steps = estimate_kwh(app, billing_days)
        raw_estimates[app_id] = (raw_val, steps)

    # 2. unmeasured load
    other_raw = OTHER_SHARE * units_consumed

    # 3. Sum total
    total = sum(raw_val for raw_val, _ in raw_estimates.values()) + other_raw

    # 4. Scale factor anchor
    if total == 0:
        raise CalculatorError(
            reason="SERVER_ERROR",
            message="Total estimated consumption before normalisation is zero.",
            status_code=500
        )
    scale = units_consumed / total

    breakdown_list = []
    
    # 5. Multiply value by scale & append working steps
    for app in appliances:
        if isinstance(app, dict):
            app_id = app.get("id")
            app_type = app.get("type")
        else:
            app_id = getattr(app, "id", None)
            app_type = getattr(app, "type", None)
        raw_val, steps = raw_estimates[app_id]

        final_units = raw_val * scale
        final_rupees = final_units * rate

        # Duplicate working steps list to avoid mutating cache / raw list in tests
        steps_copy = list(steps)
        steps_copy.extend([
            {"label": "Normalisation Scale Factor", "value": f"{scale:.3f}"},
            {"label": "Final Calibrated Consumption", "value": f"{final_units:.2f} kWh"}
        ])

        # A custom appliance shows the name the USER gave it. Falling back to
        # the generic catalogue label would hide which device a row refers to
        # as soon as someone adds two of them.
        if isinstance(app, dict):
            user_label = app.get("label")
        else:
            user_label = getattr(app, "label", None)
        display_label = (user_label or "").strip() or LABELS[app_type]

        item = {
            "type": app_type,
            "label": display_label,
            "units": round(final_units, 2),
            "rupees": round(final_rupees, 2),
            "percent": float(round(final_units / units_consumed * 100)),
            "working": steps_copy,
            "assumptions": build_assumptions(app)
        }
        breakdown_list.append(item)

    # Add other item
    other_units = other_raw * scale
    other_rupees = other_units * rate
    other_item = {
        "type": "other",
        "label": LABELS["other"],
        "units": round(other_units, 2),
        "rupees": round(other_rupees, 2),
        "percent": float(round(other_units / units_consumed * 100))
    }
    
    # Ranks
    # Sort appliance items desc by rupees
    breakdown_list.sort(key=lambda x: x["rupees"], reverse=True)
    for idx, item in enumerate(breakdown_list):
        item["rank"] = idx + 1

    # Force 'other' to last rank
    other_item["rank"] = len(breakdown_list) + 1
    breakdown_list.append(other_item)

    conf_pct, conf_reasons = confidence(bill, appliances, scale)

    return {
        "bill_total_rupees": float(total_amount),
        "breakdown": breakdown_list,
        "scale_factor": round(scale, 3),
        "confidence_percent": float(conf_pct),
        "confidence_reasons": conf_reasons
    }
