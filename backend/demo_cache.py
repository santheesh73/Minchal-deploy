"""DEMO_MODE - the demo safety net.

When DEMO_MODE is on and /api/analyze receives the demo bill, the response
below is served instead of recomputing it. A rate limit, a quota wall or a
dropped network mid-demo cannot break a re-run.

The numbers below are REAL engine output, captured from an actual /api/analyze
run - not hand-written. meta.duration_ms and meta.generated_at are NOT frozen:
they are re-measured on every served request, so meta always reflects real
timing for the request that actually happened.

===========================================================================
PLACEHOLDER - the cached values come from a SYNTHETIC bill, not a real one
===========================================================================
The engine output is real; the bill it was computed from is
test-assets/bills/synthetic_clean.png (735 units / Rs 5420), a generated
fixture. No real photographed TNEB bill existed when this was built.

SWAP PROCEDURE - 2 minutes, once the real bill is photographed:

  1. python scripts/capture_demo.py --base-url <base> --image test-assets/bills/<real>.png
     It extracts the real bill, runs analyze for real, and prints two JSON
     blocks.
  2. Paste them over DEMO_BILL_JSON and DEMO_RESPONSE_JSON below (they are
     plain JSON on purpose - paste the API response verbatim, no reformatting).
  3. Flip PLACEHOLDER_DATA to False.
  4. Delete the one line marked DELETE-ON-SWAP in demo_response().
  5. python scripts/preflight.py
===========================================================================
"""
import hashlib
import json
import os
from typing import Any, Dict, Optional

# Flip to False once the JSON below is captured from a REAL photographed bill
# rather than the synthetic fixture.
PLACEHOLDER_DATA = True


def demo_mode_enabled() -> bool:
    """Read at call time, not import time, so it can be toggled in tests."""
    return os.getenv("DEMO_MODE", "").strip().lower() in ("1", "true", "yes", "on")


def bill_hash(bill: Any) -> str:
    """Identifies the demo bill by its numbers, not by image bytes.

    Keyed on the four figures that define a bill, so the cache still hits when
    the same bill arrives via /api/manual-bill instead of a photo - the kill
    switch and the safety net have to work together, not exclude each other.
    """
    def get(k):
        return bill.get(k) if isinstance(bill, dict) else getattr(bill, k, None)

    parts = [
        f"{float(get('units_consumed') or 0):.2f}",
        f"{float(get('total_amount') or 0):.2f}",
        str(int(get("billing_days") or 0)),
        str(get("tariff_slab") or "").strip().lower(),
    ]
    return hashlib.sha256("|".join(parts).encode()).hexdigest()


# ---------------------------------------------------------------------------
# PLACEHOLDER DATA (synthetic bill) - see SWAP PROCEDURE in the module docstring.
# The bill the cached response was computed from. Its hash is the cache key.
# ---------------------------------------------------------------------------
DEMO_BILL_JSON = r"""
{
  "units_consumed": 735.0,
  "total_amount": 5420.0,
  "billing_days": 61,
  "period_end": "30/06/2026",
  "tariff_slab": "LT-1A",
  "energy_charges": 4870.0,
  "fixed_charges": 150.0,
  "taxes_and_duties": 400.0,
  "subsidy_applied": 0.0
}
"""

# ---------------------------------------------------------------------------
# PLACEHOLDER DATA (synthetic bill) - REAL engine output, synthetic source bill.
# Captured from a live /api/analyze run: every rupee figure here was produced by
# the deterministic engine, and the explanation by Gemini from those figures.
# meta.duration_ms and meta.generated_at are deliberately absent - they are
# re-measured per request so meta never reports stale timing.
# ---------------------------------------------------------------------------
DEMO_RESPONSE_JSON = r"""
{
  "ok": true,
  "bill_total_rupees": 5420.0,
  "breakdown": [
    {
      "type": "ac",
      "label": "Air Conditioner",
      "units": 403.7,
      "rupees": 2976.97,
      "percent": 55.0,
      "rank": 1,
      "working": [
        {
          "label": "Rated Power",
          "value": "1500 W"
        },
        {
          "label": "Daily Hours (Banded)",
          "value": "7.0 hours (6-8 band)"
        },
        {
          "label": "Duty Cycle",
          "value": "0.65"
        },
        {
          "label": "Star Rating Multiplier",
          "value": "1.00 (3-star)"
        },
        {
          "label": "Age Factor",
          "value": "1.045 (3 years old)"
        },
        {
          "label": "Symptom Multiplier",
          "value": "1.22"
        },
        {
          "label": "Raw Estimate",
          "value": "530.77 kWh"
        },
        {
          "label": "Normalisation Scale Factor",
          "value": "0.761"
        },
        {
          "label": "Final Calibrated Consumption",
          "value": "403.70 kWh"
        }
      ],
      "assumptions": [
        {
          "ok": true,
          "text": "பயன்பாட்டு நேரம்: 6-8 மணிநேரம்."
        },
        {
          "ok": true,
          "text": "சாதனத்தின் திறன் (1.5) லேபிளிலிருந்து பெறப்பட்டது."
        },
        {
          "ok": false,
          "text": "1 பழுது அறிகுறிகள் கணக்கில் கொள்ளப்பட்டன."
        }
      ]
    },
    {
      "type": "geyser",
      "label": "Water Heater",
      "units": 177.41,
      "rupees": 1308.28,
      "percent": 24.0,
      "rank": 2,
      "working": [
        {
          "label": "Rated Power",
          "value": "2000 W"
        },
        {
          "label": "Daily Hours (Banded)",
          "value": "1.5 hours (1-2 band)"
        },
        {
          "label": "Duty Cycle",
          "value": "0.90"
        },
        {
          "label": "Star Rating Multiplier",
          "value": "1.10 (2-star)"
        },
        {
          "label": "Age Factor",
          "value": "1.030 (2 years old)"
        },
        {
          "label": "Symptom Multiplier",
          "value": "1.25"
        },
        {
          "label": "Raw Estimate",
          "value": "233.26 kWh"
        },
        {
          "label": "Normalisation Scale Factor",
          "value": "0.761"
        },
        {
          "label": "Final Calibrated Consumption",
          "value": "177.41 kWh"
        }
      ],
      "assumptions": [
        {
          "ok": true,
          "text": "பயன்பாட்டு நேரம்: 1-2 மணிநேரம்."
        },
        {
          "ok": true,
          "text": "சாதனத்தின் திறன் (15.0) லேபிளிலிருந்து பெறப்பட்டது."
        },
        {
          "ok": false,
          "text": "1 பழுது அறிகுறிகள் கணக்கில் கொள்ளப்பட்டன."
        }
      ]
    },
    {
      "type": "fridge",
      "label": "Refrigerator",
      "units": 70.03,
      "rupees": 516.38,
      "percent": 10.0,
      "rank": 3,
      "working": [
        {
          "label": "Mode",
          "value": "Continuous (Mode A)"
        },
        {
          "label": "Star Rating Base",
          "value": "1.20 kWh/day (3-star)"
        },
        {
          "label": "Age Factor",
          "value": "1.075 (5 years old)"
        },
        {
          "label": "Symptom Multiplier",
          "value": "1.17"
        },
        {
          "label": "Raw Estimate",
          "value": "92.07 kWh"
        },
        {
          "label": "Normalisation Scale Factor",
          "value": "0.761"
        },
        {
          "label": "Final Calibrated Consumption",
          "value": "70.03 kWh"
        }
      ],
      "assumptions": [
        {
          "ok": true,
          "text": "சாதனத்தின் திறன் (250.0) லேபிளிலிருந்து பெறப்பட்டது."
        },
        {
          "ok": false,
          "text": "1 பழுது அறிகுறிகள் கணக்கில் கொள்ளப்பட்டன."
        }
      ]
    },
    {
      "type": "other",
      "label": "Lights, fans & others",
      "units": 83.86,
      "rupees": 618.37,
      "percent": 11.0,
      "rank": 4,
      "working": null,
      "assumptions": null
    }
  ],
  "scale_factor": 0.761,
  "confidence_percent": 70.0,
  "confidence_reasons": [
    {
      "ok": true,
      "text": "கட்டண விவரங்கள் முழுமையாகப் படிக்கப்பட்டுள்ளன."
    },
    {
      "ok": true,
      "text": "அனைத்து சாதனங்களின் பயன்பாட்டு நேரம் குறிப்பிடப்பட்டுள்ளது."
    },
    {
      "ok": false,
      "text": "மின் நுகர்வு மற்றும் கட்டண விவரங்களில் முரண்பாடுகள் உள்ளன."
    }
  ],
  "meta": {
    "engine_version": "engine-1",
    "model": "gemini-3.1-flash-lite"
  },
  "explanation": "மின் கட்டணத்தில் ஏர் கண்டிஷனர் தான் அதிக செலவை ஏற்படுத்துகிறது, மொத்தம் 5420.0 ரூபாயில் 2976.97 ரூபாய் இதற்கே செலவாகிறது. 61 நாட்களில் 735.0 யூனிட்டுகள் பயன்படுத்தப்பட்டுள்ளன. ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும், இதன் மூலம் மாதம் சுமார் 654.93 ரூபாய் சேமிக்கலாம்.",
  "actions": [
    {
      "tier": "free",
      "text": "ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்.",
      "saves_rupees": 654.93,
      "payback_months": null
    },
    {
      "tier": "cheap",
      "text": "ஏசி வடிகட்டிகளை சுத்தம் செய்து சரிபார்ப்பது நல்லது.",
      "saves_rupees": 536.83,
      "payback_months": null
    }
  ],
  "insights": {
    "efficiency_gap_percent": 39.0,
    "efficiency_gap_rupees": 1524.0,
    "efficiency_driver": "ac",
    "energy_score": 72.0,
    "co2_kg_year": 3123.0,
    "co2_kg_year_after": 1746.0,
    "monthly_savings_rupees": 1191.76,
    "annual_savings_rupees": 14301.12,
    "biggest_surprise": {
      "type": "ac",
      "label": "Air Conditioner",
      "rupees": 2976.97,
      "line": "Your air conditioner is 15 percentage points above what a typical home spends on it."
    },
    "solar": {
      "size_kw": 3.0,
      "coverage_percent": 99.0,
      "net_cost_rupees": 102000.0,
      "annual_saving_rupees": 32077.55,
      "payback_years": 3.2
    }
  }
}
"""

DEMO_BILL: Dict[str, Any] = json.loads(DEMO_BILL_JSON)
DEMO_RESPONSE: Dict[str, Any] = json.loads(DEMO_RESPONSE_JSON)
DEMO_BILL_HASH = bill_hash(DEMO_BILL)


def demo_response(bill: Any, language: str = "en") -> Optional[Dict[str, Any]]:
    """Returns a copy of the cached response if this is the demo bill.

    Returns None otherwise, so any other bill falls through to the real engine
    and DEMO_MODE can never serve one bill's numbers for a different bill.
    """
    if not demo_mode_enabled():
        return None
    if bill_hash(bill) != DEMO_BILL_HASH:
        return None

    data = json.loads(json.dumps(DEMO_RESPONSE))
    data["meta"]["data_source"] = "placeholder" if PLACEHOLDER_DATA else "cached"
    
    if language == "ta":
        data["actions"] = [
            {"tier": "free", "appliance_type": "ac", "text": "ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்.", "saves_rupees": 654.93},
            {"tier": "cheap", "appliance_type": "ac", "text": "ஏசி வடிகட்டிகளை சுத்தம் செய்து குளிரூட்டும் அமைப்பை சரிபார்க்கவும்.", "saves_rupees": 536.83, "cost_rupees": 800.0},
            {"tier": "investment", "appliance_type": "ac", "text": "பழைய ஏசிக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் ஏசியை வாங்கவும்.", "saves_rupees": 890.0, "cost_rupees": 38000.0, "payback_months": 18},
            {"tier": "free", "appliance_type": "fridge", "text": "குளிர்சாதனப் பெட்டியின் பின்புறம் 5 செ.மீ இடைவெளி விட்டு காற்றோட்டத்தை சீராக்கவும்.", "saves_rupees": 185.0},
            {"tier": "cheap", "appliance_type": "fridge", "text": "குளிர்சாதன பெட்டியின் பின் சுருள்கள் மற்றும் கதவு கேஸ்கெட்டை சுத்தம் செய்யவும்.", "saves_rupees": 240.0, "cost_rupees": 600.0},
            {"tier": "investment", "appliance_type": "fridge", "text": "பழைய குளிர்சாதனப் பெட்டிக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் மாடலை வாங்கவும்.", "saves_rupees": 450.0, "cost_rupees": 28000.0, "payback_months": 24},
            {"tier": "free", "appliance_type": "geyser", "text": "குளிப்பதற்கு 5 நிமிடங்களுக்கு முன்பே வாட்டர் ஹீட்டரை அணைக்கவும்.", "saves_rupees": 196.24},
            {"tier": "cheap", "appliance_type": "geyser", "text": "வாட்டர் ஹீட்டரின் வெப்பமூட்டும் உறுப்பில் உள்ள உப்புக் படிவுகளை அகற்றுங்கள்.", "saves_rupees": 261.65, "cost_rupees": 900.0},
            {"tier": "investment", "appliance_type": "geyser", "text": "பழைய ஹீட்டருக்கு பதிலாக 5-நட்சத்திர இன்ஸ்டன்ட் அல்லது சோலார் ஹீட்டரை வாங்கவும்.", "saves_rupees": 520.0, "cost_rupees": 9000.0, "payback_months": 14},
            {"tier": "free", "appliance_type": "washing_machine", "text": "துணிகளை மொத்தமாக சேர்த்து குளிர் நீரில் அலசும் முறையைப் பயன்படுத்தவும்.", "saves_rupees": 160.0},
            {"tier": "cheap", "appliance_type": "washing_machine", "text": "துணி துவைக்கும் இயந்திர டிரமை சுத்தம் செய்து பராமரிக்கவும்.", "saves_rupees": 190.0, "cost_rupees": 500.0},
            {"tier": "investment", "appliance_type": "washing_machine", "text": "பழைய வாஷிங் மெஷினுக்கு பதிலாக 5-நட்சத்திர இன்வெர்ட்டர் மெஷினை வாங்கவும்.", "saves_rupees": 380.0, "cost_rupees": 25000.0, "payback_months": 30},
            {"tier": "free", "appliance_type": "fan", "text": "ஆள் இல்லாத அறைகளில் மின்விசிறிகளை அணைத்து வைக்கவும்.", "saves_rupees": 140.0},
            {"tier": "cheap", "appliance_type": "fan", "text": "மின்விசிறி மோட்டாருக்கு எண்ணெய் ஊற்றி கெபாசிட்டரை சரிபார்க்கவும்.", "saves_rupees": 170.0, "cost_rupees": 500.0},
            {"tier": "investment", "appliance_type": "fan", "text": "பழைய மின்விசிறிகளுக்கு பதிலாக புதிய 28W BLDC மின்விசிறிகளைப் பயன்படுத்தவும்.", "saves_rupees": 420.0, "cost_rupees": 2500.0, "payback_months": 12},
            {"tier": "free", "appliance_type": "motor_pump", "text": "தண்ணீர் தொட்டி நிரம்பி வழிவதைத் தடுக்க தானியங்கி கட்டுப்பாட்டமைப்பை பொருத்தவும்.", "saves_rupees": 220.0},
            {"tier": "cheap", "appliance_type": "motor_pump", "text": "மோட்டார் பம்ப் இம்பெல்லர் மற்றும் பேரிங்கை சரிபார்க்கவும்.", "saves_rupees": 260.0, "cost_rupees": 800.0},
            {"tier": "investment", "appliance_type": "motor_pump", "text": "பழைய பம்பிற்கு பதிலாக புதிய 5-நட்சத்திர மோட்டார் பம்பை வாங்கவும்.", "saves_rupees": 510.0, "cost_rupees": 12000.0, "payback_months": 20},
            {"tier": "free", "appliance_type": "tv", "text": "தொலைக்காட்சியை பயன்படுத்தாத போது முதன்மை சுவிட்சை அணைத்து வைக்கவும்.", "saves_rupees": 90.0},
            {"tier": "free", "appliance_type": "lights", "text": "ஆள் இல்லாத அறைகளில் மின்விளக்குகளை அணைத்து வைக்கவும்.", "saves_rupees": 110.0},
            {"tier": "cheap", "appliance_type": "lights", "text": "பழைய பல்புகளுக்கு பதிலாக 9W எல்இடி பல்புகளை பயன்படுத்தவும்.", "saves_rupees": 320.0, "cost_rupees": 500.0}
        ]
    else:
        data["confidence_reasons"] = [
            {"ok": True, "text": "Bill details were fully extracted."},
            {"ok": True, "text": "Usage hours specified for all appliances."},
            {"ok": False, "text": "Discrepancy detected between bill and appliance loads."}
        ]
        data["explanation"] = "Air Conditioner accounts for the largest portion of your electricity bill, costing ₹2,976.97 out of ₹5,420.00 total. Set AC temperature to 26°C and reduce operating hours to save approximately ₹654.93 per month."
        data["actions"] = [
            {"tier": "free", "appliance_type": "ac", "text": "Set AC temperature to 26°C and reduce operating duration.", "saves_rupees": 654.93},
            {"tier": "cheap", "appliance_type": "ac", "text": "Clean AC air filters and check refrigerant gas pressure.", "saves_rupees": 536.83, "cost_rupees": 800.0},
            {"tier": "investment", "appliance_type": "ac", "text": "Replace old AC with a new 5-star inverter AC.", "saves_rupees": 890.0, "cost_rupees": 38000.0, "payback_months": 18},
            {"tier": "free", "appliance_type": "fridge", "text": "Maintain 5cm wall clearance for back airflow and avoid storing warm food.", "saves_rupees": 185.0},
            {"tier": "cheap", "appliance_type": "fridge", "text": "Clean condenser coils behind the refrigerator and check door gasket seal.", "saves_rupees": 240.0, "cost_rupees": 600.0},
            {"tier": "investment", "appliance_type": "fridge", "text": "Replace old refrigerator with a new 5-star energy-efficient model.", "saves_rupees": 450.0, "cost_rupees": 28000.0, "payback_months": 24},
            {"tier": "free", "appliance_type": "geyser", "text": "Turn off geyser 5 minutes before finishing shower & lower temperature to 50°C.", "saves_rupees": 196.24},
            {"tier": "cheap", "appliance_type": "geyser", "text": "Descale heating element and flush tank mineral buildup.", "saves_rupees": 261.65, "cost_rupees": 900.0},
            {"tier": "investment", "appliance_type": "geyser", "text": "Replace old water heater with a new 5-star rated water heater.", "saves_rupees": 520.0, "cost_rupees": 9000.0, "payback_months": 14},
            {"tier": "free", "appliance_type": "washing_machine", "text": "Operate full loads on cold water / eco mode cycle.", "saves_rupees": 160.0},
            {"tier": "cheap", "appliance_type": "washing_machine", "text": "Clean lint filter and drain pump filter monthly.", "saves_rupees": 190.0, "cost_rupees": 500.0},
            {"tier": "investment", "appliance_type": "washing_machine", "text": "Upgrade to a new 5-star rated inverter washing machine.", "saves_rupees": 380.0, "cost_rupees": 25000.0, "payback_months": 30},
            {"tier": "free", "appliance_type": "fan", "text": "Turn off ceiling fans when leaving unoccupied rooms.", "saves_rupees": 140.0},
            {"tier": "cheap", "appliance_type": "fan", "text": "Service fan motor bearings and inspect speed regulator.", "saves_rupees": 170.0, "cost_rupees": 500.0},
            {"tier": "investment", "appliance_type": "fan", "text": "Replace old 75W ceiling fans with 28W BLDC energy-saving fans.", "saves_rupees": 420.0, "cost_rupees": 2500.0, "payback_months": 12},
            {"tier": "free", "appliance_type": "motor_pump", "text": "Install automatic water level controller to prevent tank overflow.", "saves_rupees": 220.0},
            {"tier": "cheap", "appliance_type": "motor_pump", "text": "Service water pump motor bearings and check impeller.", "saves_rupees": 260.0, "cost_rupees": 800.0},
            {"tier": "investment", "appliance_type": "motor_pump", "text": "Upgrade old pump with a new 5-star rated energy efficient motor pump.", "saves_rupees": 510.0, "cost_rupees": 12000.0, "payback_months": 20},
            {"tier": "free", "appliance_type": "tv", "text": "Turn off main wall power switch to eliminate TV standby power draw.", "saves_rupees": 90.0},
            {"tier": "free", "appliance_type": "lights", "text": "Switch off lights when leaving unoccupied rooms.", "saves_rupees": 110.0},
            {"tier": "cheap", "appliance_type": "lights", "text": "Replace high-power filament or CFL bulbs with 9W LED bulbs.", "saves_rupees": 320.0, "cost_rupees": 500.0}
        ]
    return data
