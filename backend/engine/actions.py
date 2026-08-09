import logging
from typing import List, Dict, Any, Optional
from engine.tables import (STAR_MULT, AGE_PER_YEAR, CURRENT_YEAR, REPLACEMENT_COST,
                           MAINTENANCE_COST, MAINTENANCE_COST_DEFAULT, symptom_multiplier,
                           aggregate_breakdown_by_type)

logger = logging.getLogger(__name__)

# --- Multi-Language Action Text Mappings ---

FREE_ACTION_TEXTS_TA = {
    "ac": "ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்.",
    "fridge": "குளிர்சாதனப் பெட்டியின் பின்புறம் 5 செ.மீ இடைவெளி விட்டு வெப்ப உணவை வைப்பதைத் தவிர்க்கவும்.",
    "geyser": "குளிப்பதற்கு 5 நிமிடங்களுக்கு முன்பே வாட்டர் ஹீட்டரை அணைக்கவும்.",
    "washing_machine": "துணிகளை மொத்தமாக சேர்த்து குளிர் நீரில் அலசும் முறையைப் பயன்படுத்தவும்.",
    "fan": "ஆள் இல்லாத அறைகளில் மின்விசிறிகளை அணைத்து வைக்கவும்.",
    "motor_pump": "தண்ணீர் தொட்டி நிரம்பி வழிவதைத் தடுக்க தானியங்கி கட்டுப்பாட்டமைப்பை பொருத்தவும்.",
    "tv": "தொலைக்காட்சியை பயன்படுத்தாத போது முதன்மை சுவிட்சை அணைத்து வைக்கவும்.",
    "lights": "ஆள் இல்லாத அறைகளில் மின்விளக்குகளை அணைத்து வைக்கவும்."
}

FREE_ACTION_TEXTS_EN = {
    "ac": "Set AC temperature to 26°C and reduce operating duration.",
    "fridge": "Maintain 5cm wall clearance for back airflow and avoid storing warm food.",
    "geyser": "Turn off geyser 5 minutes before finishing shower & lower temperature to 50°C.",
    "washing_machine": "Operate full loads on cold water / eco mode cycle.",
    "fan": "Turn off ceiling fans when leaving unoccupied rooms.",
    "motor_pump": "Install automatic water level controller to prevent tank overflow.",
    "tv": "Turn off main wall power switch to eliminate TV standby power draw.",
    "lights": "Switch off lights when leaving unoccupied rooms."
}

SYMPTOM_ACTION_TEXT_TA = {
    "dirty_filters": "ஏசி வடிகட்டிகளை சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
    "dirty_coils": "குளிர்சாதன பெட்டியின் பின் சுருள்களை (coils) சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
    "door_seal": "குளிர்சாதன கதவு கேஸ்கெட்டை சரிபார்ப்பது நல்லது.",
    "scaled": "வாட்டர் ஹீட்டரின் வெப்பமூட்டும் உறுப்பை (heating element) சரிபார்ப்பது நல்லது.",
    "ice_buildup": "உறைவிப்பான் ஐஸ் கட்டிகளை சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
    "low_gas": "ஏசி குளிரூட்டி வாயுவை நிரப்பி கசிவுகளை சரிசெய்யவும்.",
    "not_cold": "ஏசி கம்ப்ரஸரை பரிசோதித்து குளிரூட்டும் அமைப்பை பராமரிக்கவும்.",
    "leaking": "வாட்டர் ஹீட்டர் தொட்டி கசிவை சரிசெய்யவும்.",
    "not_clean": "துணி துவைக்கும் இயந்திர டிரமை சுத்தம் செய்து பராமரிக்கவும்.",
    "slow": "மின்விசிறி மோட்டாருக்கு எண்ணெய் ஊற்றி கெபாசிட்டரை சரிபார்க்கவும்.",
    "weak_flow": "மோட்டார் பம்ப் இம்பெல்லர் மற்றும் பேரிங்கை சரிபார்க்கவும்.",
    "filament": "பழைய பல்புகளுக்கு பதிலாக 9W எல்இடி பல்புகளை பயன்படுத்தவும்."
}

SYMPTOM_ACTION_TEXT_EN = {
    "dirty_filters": "Clean and service the AC air filters.",
    "dirty_coils": "Clean the condenser coils behind the refrigerator.",
    "door_seal": "Inspect and replace the refrigerator door gasket seal.",
    "scaled": "Descale and inspect the water heater heating element.",
    "ice_buildup": "Defrost and clean freezer ice accumulation.",
    "low_gas": "Top up AC refrigerant gas and seal pipe leakages.",
    "not_cold": "Service AC compressor and check refrigerant levels.",
    "leaking": "Repair water heater tank leakage and safety valve.",
    "not_clean": "Service washing machine drum and clean drain filter.",
    "slow": "Lubricate fan motor bearings and inspect capacitor.",
    "weak_flow": "Service water pump motor bearings and check impeller.",
    "filament": "Replace high-power filament bulbs with 9W energy-efficient LED bulbs."
}

DEFAULT_CHEAP_ACTION_TEXT_EN = {
    "ac": "Clean AC air filters and check refrigerant gas pressure.",
    "fridge": "Clean condenser coils behind the refrigerator and check door gasket seal.",
    "geyser": "Descale heating element and flush tank mineral buildup.",
    "washing_machine": "Clean lint filter and drain pump filter monthly.",
    "fan": "Service fan motor bearings and inspect speed regulator.",
    "motor_pump": "Service water pump motor bearings and check impeller.",
    "tv": "Adjust screen backlight brightness from 100% to 70%.",
    "lights": "Replace high-power filament or CFL bulbs with 9W LED bulbs."
}

DEFAULT_CHEAP_ACTION_TEXT_TA = {
    "ac": "ஏசி வடிகட்டிகளை சுத்தம் செய்து குளிரூட்டும் அமைப்பை சரிபார்க்கவும்.",
    "fridge": "குளிர்சாதன பெட்டியின் பின் சுருள்கள் மற்றும் கதவு கேஸ்கெட்டை சுத்தம் செய்யவும்.",
    "geyser": "வாட்டர் ஹீட்டரின் வெப்பமூட்டும் உறுப்பில் உள்ள உப்புக் படிவுகளை அகற்றுங்கள்.",
    "washing_machine": "துணி துவைக்கும் இயந்திர டிரமை சுத்தம் செய்து பராமரிக்கவும்.",
    "fan": "மின்விசிறி மோட்டாருக்கு எண்ணெய் ஊற்றி கெபாசிட்டரை சரிபார்க்கவும்.",
    "motor_pump": "மோட்டார் பம்ப் இம்பெல்லர் மற்றும் பேரிங்கை சரிபார்க்கவும்.",
    "tv": "திரை வெளிச்சத்தை (Backlight) 100% லிருந்து 70% ஆகக் குறைக்கவும்.",
    "lights": "பழைய பல்புகளுக்கு பதிலாக 9W எல்இடி பல்புகளை பயன்படுத்தவும்."
}

REPLACEMENT_ACTION_TEXT_TA = {
    "ac": "பழைய ஏசிக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் ஏசியை வாங்கவும்.",
    "fridge": "பழைய குளிர்சாதனப் பெட்டிக்கு பதிலாக புதிய 5-நட்சத்திர குளிர்சாதனப் பெட்டியை வாங்கவும்.",
    "geyser": "பழைய வாட்டர் ஹீட்டருக்கு பதிலாக புதிய 5-நட்சத்திர வாட்டர் ஹீட்டரை வாங்கவும்.",
    "washing_machine": "பழைய வாஷிங் மெஷினுக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் மெஷினை வாங்கவும்.",
    "fan": "பழைய மின்விசிறிகளுக்கு பதிலாக புதிய 28W BLDC மின்விசிறிகளைப் பயன்படுத்தவும்.",
    "motor_pump": "பழைய பம்பிற்கு பதிலாக புதிய 5-நட்சத்திர மோட்டார் பம்பை வாங்கவும்."
}

REPLACEMENT_ACTION_TEXT_EN = {
    "ac": "Replace old AC with a new 5-star inverter AC.",
    "fridge": "Replace old refrigerator with a new 5-star energy-efficient model.",
    "geyser": "Replace old water heater with a new 5-star rated water heater.",
    "washing_machine": "Upgrade to a new 5-star rated inverter washing machine.",
    "fan": "Replace old 75W ceiling fans with 28W BLDC energy-saving fans.",
    "motor_pump": "Upgrade old pump with a new 5-star rated energy efficient motor pump."
}

FREE_ACTION_TEXT_TA = FREE_ACTION_TEXTS_TA["ac"]
FREE_ACTION_TEXT_EN = FREE_ACTION_TEXTS_EN["ac"]

# Alias exports for backward compatibility
SYMPTOM_ACTION_TEXT = SYMPTOM_ACTION_TEXT_TA
REPLACEMENT_ACTION_TEXT = REPLACEMENT_ACTION_TEXT_TA


def _field(appliance: Any, name: str, default: Any = None) -> Any:
    if isinstance(appliance, dict):
        value = appliance.get(name)
    else:
        value = getattr(appliance, name, None)
    return default if value is None else value


def generate_actions(appliances: List[Any], breakdown: List[Dict[str, Any]], rate: float, days: int, language: str = "en") -> List[Dict[str, Any]]:
    """Generates prioritized action plans for ALL chosen appliances in the breakdown."""
    actions = []
    is_ta = language == "ta"
    free_texts = FREE_ACTION_TEXTS_TA if is_ta else FREE_ACTION_TEXTS_EN
    symptom_texts = SYMPTOM_ACTION_TEXT_TA if is_ta else SYMPTOM_ACTION_TEXT_EN
    default_cheap_texts = DEFAULT_CHEAP_ACTION_TEXT_TA if is_ta else DEFAULT_CHEAP_ACTION_TEXT_EN
    replacement_texts = REPLACEMENT_ACTION_TEXT_TA if is_ta else REPLACEMENT_ACTION_TEXT_EN

    breakdown_by_type = aggregate_breakdown_by_type(breakdown)

    # 1. FREE HABIT ACTIONS (For EVERY appliance type present in breakdown)
    for app_type, app_data in breakdown_by_type.items():
        if app_type in free_texts:
            app_rupees = app_data.get("rupees", 0.0)
            if app_type == "ac":
                saves = app_rupees * 0.22
            elif app_type == "fridge":
                saves = app_rupees * 0.10
            elif app_type == "geyser":
                saves = app_rupees * 0.15
            elif app_type == "washing_machine":
                saves = app_rupees * 0.20
            elif app_type == "fan":
                saves = app_rupees * 0.15
            elif app_type == "motor_pump":
                saves = app_rupees * 0.25
            elif app_type == "tv":
                saves = app_rupees * 0.10
            elif app_type == "lights":
                saves = app_rupees * 0.15
            else:
                saves = app_rupees * 0.10

            if saves > 0:
                actions.append({
                    "tier": "free",
                    "appliance_type": app_type,
                    "text": free_texts[app_type],
                    "saves_rupees": round(saves, 2),
                    "cost_rupees": 0.0
                })

    # 2. CHEAP MAINTENANCE FIXES (For ALL chosen appliances)
    symptom_added_types = set()
    for a in appliances:
        a_id = _field(a, "id")
        a_type = _field(a, "type")
        symptoms = _field(a, "symptoms", []) or []
        
        if a_type not in breakdown_by_type:
            continue
            
        app_rupees = breakdown_by_type[a_type]["rupees"]

        for symptom in symptoms:
            if symptom in symptom_texts:
                mult = symptom_multiplier(a_type, symptom)
                if mult > 1.0:
                    saving = app_rupees * (1.0 - 1.0 / mult)
                    if saving > 0:
                        symptom_added_types.add(a_type)
                        actions.append({
                            "tier": "cheap",
                            "appliance_type": a_type,
                            "text": symptom_texts[symptom],
                            "saves_rupees": round(saving, 2),
                            "cost_rupees": float(MAINTENANCE_COST.get(symptom, MAINTENANCE_COST_DEFAULT)),
                        })

    # For non-AC appliances in breakdown that did NOT have explicit symptoms, add default cheap maintenance action
    for app_type, app_data in breakdown_by_type.items():
        if app_type not in ("ac", "other") and app_type not in symptom_added_types and app_type in default_cheap_texts:
            app_rupees = app_data.get("rupees", 0.0)
            saving = app_rupees * 0.15
            if saving > 0:
                actions.append({
                    "tier": "cheap",
                    "appliance_type": app_type,
                    "text": default_cheap_texts[app_type],
                    "saves_rupees": round(saving, 2),
                    "cost_rupees": float(MAINTENANCE_COST.get(app_type, 600.0)),
                })

    # 3. INVESTMENT REPLACEMENTS (For ALL chosen appliances in breakdown)
    for app_type, app_data in breakdown_by_type.items():
        if app_type in REPLACEMENT_COST:
            app_rupees = app_data.get("rupees", 0.0)
            saving = app_rupees * 0.30
            monthly_saving = saving * 30.0 / max(1, days)
            if monthly_saving > 0:
                cost = float(REPLACEMENT_COST[app_type])
                payback = round(cost / monthly_saving)
                actions.append({
                    "tier": "investment",
                    "appliance_type": app_type,
                    "text": replacement_texts.get(app_type, f"Replace old {app_type} with a 5-star model."),
                    "saves_rupees": round(saving, 2),
                    "payback_months": int(max(1, payback)),
                    "cost_rupees": cost,
                })

    # Deduplicate actions by text to avoid repeats
    unique_actions = []
    seen_texts = set()
    for act in actions:
        if act["text"] not in seen_texts:
            seen_texts.add(act["text"])
            unique_actions.append(act)

    return unique_actions


MONTHS_PER_YEAR = 12


def plan_within_budget(actions: List[Dict[str, Any]], budget_rupees: float, language: str = "en") -> Dict[str, Any]:
    """Picks the set of actions that maximises annual saving within a budget."""
    try:
        budget = max(0.0, float(budget_rupees))
    except (TypeError, ValueError):
        budget = 0.0

    is_ta = language == "ta"

    def annual(a):
        return round(float(a.get("saves_rupees", 0.0)) * MONTHS_PER_YEAR, 2)

    def cost(a):
        c = a.get("cost_rupees")
        return 0.0 if c is None else float(c)

    free = [a for a in actions if cost(a) <= 0]
    priced = [a for a in actions if cost(a) > 0]

    priced.sort(key=lambda a: (-(annual(a) / (cost(a) or 1.0)), cost(a)))

    selected = list(free)
    excluded = []
    spent = 0.0

    for a in priced:
        c = cost(a)
        if spent + c <= budget:
            selected.append(a)
            spent += c
        else:
            reason_str = (
                f"செலவு ₹{c:,.0f}; ₹{budget:,.0f} பட்ஜெட்டில் ₹{budget - spent:,.0f} மட்டுமே பாக்கி இருந்தது."
                if is_ta else
                f"Costs Rs {c:,.0f}; only Rs {budget - spent:,.0f} of the Rs {budget:,.0f} budget was left."
            )
            excluded.append({
                "tier": a.get("tier"),
                "text": a.get("text"),
                "cost_rupees": c,
                "saves_rupees": float(a.get("saves_rupees", 0.0)),
                "annual_saving_rupees": annual(a),
                "reason": reason_str,
            })

    total_annual = round(sum(annual(a) for a in selected), 2)

    return {
        "budget_rupees": round(budget, 2),
        "selected": selected,
        "excluded": excluded,
        "total_cost_rupees": round(spent, 2),
        "total_annual_saving_rupees": total_annual,
        "budget_remaining_rupees": round(budget - spent, 2),
    }
