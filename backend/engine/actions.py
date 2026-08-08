import logging
from typing import List, Dict, Any, Optional
from engine.tables import STAR_MULT, AGE_PER_YEAR, CURRENT_YEAR, REPLACEMENT_COST, symptom_multiplier

logger = logging.getLogger(__name__)

# Tamil Action Texts
SYMPTOM_ACTION_TEXT = {
    "dirty_filters": "ஏசி வடிகட்டிகளை சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
    "dirty_coils": "குளிர்சாதன பெட்டியின் பின் சுருள்களை (coils) சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
    "door_seal": "குளிர்சாதன கதவு கேஸ்கெட்டை சரிபார்ப்பது நல்லது.",
    "scaled": "வாட்டர் ஹீட்டரின் வெப்பமூட்டும் உறுப்பை (heating element) சரிபார்ப்பது நல்லது.",
    "ice_buildup": "உறைவிப்பான் ஐஸ் கட்டிகளை சுத்தம் செய்து சரிபார்ப்பது நல்லது."
}

REPLACEMENT_ACTION_TEXT = {
    "ac": "பழைய ஏசிக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் ஏசியை வாங்கவும்.",
    "fridge": "பழைய குளிர்சாதனப் பெட்டிக்கு பதிலாக புதிய 5-நட்சத்திர குளிர்சாதனப் பெட்டியை வாங்கவும்.",
    "geyser": "பழைய வாட்டர் ஹீட்டருக்கு பதிலாக புதிய 5-நட்சத்திர வாட்டர் ஹீட்டரை வாங்கவும்."
}



def _field(appliance: Any, name: str, default: Any = None) -> Any:
    """Reads a field from an appliance whether it is a pydantic model or a dict.

    The previous idiom, `getattr(a, name, None) or a.get(name)`, was a live
    crash: `or` falls through on any FALSY value, not just a missing one. An
    appliance with no symptoms has symptoms == [] — falsy — so it called .get()
    on a pydantic ApplianceInput and raised
    "'ApplianceInput' object has no attribute 'get'", 500ing the whole analysis.

    Every mock request had symptoms on every appliance, so preflight and the
    tests never saw it. The real frontend sends [] when the user ticks no
    symptoms, which is the common case — most users have nothing to report.
    Same trap for hours_band=None and star=0.
    """
    if isinstance(appliance, dict):
        value = appliance.get(name)
    else:
        value = getattr(appliance, name, None)
    return default if value is None else value


def generate_actions(appliances: List[Any], breakdown: List[Dict[str, Any]], rate: float, days: int) -> List[Dict[str, Any]]:
    """Generates at most one action per tier (free, cheap, investment)."""
    actions = []

    # Map breakdown list to a dict for easy rupees lookup
    breakdown_by_type = {item["type"]: item for item in breakdown}

    # 1. FREE ACTION (AC present and running hours >= "4-6")
    ac_app = None
    for a in appliances:
        a_type = _field(a, "type")
        if a_type == "ac":
            h_band = _field(a, "hours_band")
            if h_band in ["4-6", "6-8", "8+"]:
                ac_app = a
                break

    if ac_app is not None and "ac" in breakdown_by_type:
        ac_rupees = breakdown_by_type["ac"]["rupees"]
        saves = ac_rupees * 0.22
        if saves > 0:
            actions.append({
                "tier": "free",
                "text": "ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்.",
                "saves_rupees": round(saves, 2)
            })

    # 2. CHEAP ACTION (Symptom-driven maintenance fix)
    best_cheap = None
    max_cheap_saving = 0.0

    for a in appliances:
        a_id = _field(a, "id")
        a_type = _field(a, "type")
        symptoms = _field(a, "symptoms", []) or []
        
        if a_type not in breakdown_by_type:
            continue
            
        app_rupees = breakdown_by_type[a_type]["rupees"]

        for symptom in symptoms:
            if symptom in SYMPTOM_ACTION_TEXT:
                mult = symptom_multiplier(a_type, symptom)
                if mult > 1.0:
                    saving = app_rupees * (1.0 - 1.0 / mult)
                    if saving > max_cheap_saving:
                        max_cheap_saving = saving
                        best_cheap = {
                            "tier": "cheap",
                            "text": SYMPTOM_ACTION_TEXT[symptom],
                            "saves_rupees": round(saving, 2)
                        }

    if best_cheap is not None:
        actions.append(best_cheap)

    # 3. INVESTMENT ACTION (Replacement)
    best_inv = None
    max_inv_saving = 0.0

    for a in appliances:
        a_id = _field(a, "id")
        a_type = _field(a, "type")
        star = _field(a, "star", 3)
        year = _field(a, "year", CURRENT_YEAR)
        
        if a_type not in REPLACEMENT_COST:
            continue
            
        age = max(0, CURRENT_YEAR - int(year))
        
        if age > 8 and star <= 3 and a_type in breakdown_by_type:
            app_rupees = breakdown_by_type[a_type]["rupees"]
            age_f = 1.0 + AGE_PER_YEAR * age
            
            # STAR_MULT mapping
            s_mult = STAR_MULT.get(star, 1.0)
            star_5_mult = STAR_MULT.get(5, 0.82)
            
            saving = app_rupees * (1.0 - star_5_mult / s_mult / age_f)
            
            if saving > max_inv_saving:
                monthly_saving = saving * 30.0 / days
                if monthly_saving > 0:
                    payback = round(REPLACEMENT_COST[a_type] / monthly_saving)
                    max_inv_saving = saving
                    best_inv = {
                        "tier": "investment",
                        "text": REPLACEMENT_ACTION_TEXT[a_type],
                        "saves_rupees": round(saving, 2),
                        "payback_months": int(payback)
                    }

    if best_inv is not None:
        actions.append(best_inv)

    return actions
