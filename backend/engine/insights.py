import logging
from copy import deepcopy
from typing import List, Dict, Any, Tuple, Optional
from engine.tables import (
    CO2_PER_KWH,
    TYPICAL_SHARE,
    TYPICAL_SHARE_DEFAULT,
    SOLAR_MIN_KW,
    SOLAR_MAX_KW,
    COST_PER_KW,
    SUBSIDY_TABLE,
    IRRADIANCE_KWH_PER_KW_YEAR,
    CURRENT_YEAR
)
from engine.calculator import estimate_kwh

logger = logging.getLogger(__name__)

def efficiency_gap(appliances: List[Any], bill: Any, days: int, rate: float) -> Dict[str, Any]:
    """How much more this home uses than the SAME appliances would if every
    one were new and 5-star. Two computed quantities, one ratio."""
    actual_bill_units = getattr(bill, "units_consumed", None)
    if actual_bill_units is None and isinstance(bill, dict):
        actual_bill_units = bill.get("units_consumed")

    if not actual_bill_units or actual_bill_units <= 0:
        return {
            "efficiency_gap_percent": 0.0,
            "efficiency_gap_rupees": 0.0,
            "efficiency_driver": "",
            "energy_score": 100.0
        }

    ideal = 0.0
    deltas = []

    for a in appliances:
        # Create ideal clone
        if isinstance(a, dict):
            a_ideal = dict(a)
            a_ideal["star"] = 5
            a_ideal["year"] = CURRENT_YEAR
            a_ideal["symptoms"] = []
            a_id = a.get("id")
            a_type = a.get("type")
        else:
            a_ideal = deepcopy(a)
            a_ideal.star = 5
            a_ideal.year = CURRENT_YEAR
            a_ideal.symptoms = []
            a_id = getattr(a, "id", None)
            a_type = getattr(a, "type", None)

        # Estimate ideal
        ideal_est, _ = estimate_kwh(a_ideal, days)
        ideal += ideal_est

        # Estimate actual
        actual_est, _ = estimate_kwh(a, days)
        
        delta = actual_est - ideal_est
        deltas.append((a_type, delta))

    if ideal <= 0:
        return {
            "efficiency_gap_percent": 0.0,
            "efficiency_gap_rupees": 0.0,
            "efficiency_driver": "",
            "energy_score": 100.0
        }

    gap_percent = max(0.0, float(round((actual_bill_units - ideal) / ideal * 100.0)))
    gap_rupees = max(0.0, float(round((actual_bill_units - ideal) * rate)))
    score = float(round(min(100.0, ideal / actual_bill_units * 100.0)))

    # Find driver type
    driver_type = ""
    if deltas:
        deltas.sort(key=lambda x: x[1], reverse=True)
        # Only select if delta is positive
        if deltas[0][1] > 0:
            driver_type = deltas[0][0]

    return {
        "efficiency_gap_percent": gap_percent,
        "efficiency_gap_rupees": gap_rupees,
        "efficiency_driver": driver_type,
        "energy_score": score
    }


def co2(units_per_cycle: float, days: int) -> int:
    return round(units_per_cycle * (365.0 / days) * CO2_PER_KWH)


def savings(actions: List[Dict[str, Any]], bill_total: float) -> Dict[str, float]:
    """Cums savings from actions, capped at 40% of the actual bill."""
    monthly = sum(a.get("saves_rupees", 0.0) for a in actions)
    
    cap = bill_total * 0.40
    if monthly > cap:
        logger.warning(f"Savings estimate of ₹{monthly:.2f} was capped at ₹{cap:.2f} (40% of bill total).")
        monthly = cap

    annual = monthly * 12.0
    return {
        "monthly_savings_rupees": round(monthly, 2),
        "annual_savings_rupees": round(annual, 2)
    }


def biggest_surprise(breakdown: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """The appliance that most exceeds what a typical home spends on it."""
    deviations = []
    
    for item in breakdown:
        item_type = item.get("type")
        if item_type == "other":
            continue
            
        expected = TYPICAL_SHARE.get(item_type, TYPICAL_SHARE_DEFAULT)
        pct = item.get("percent", 0.0)
        deviation = (pct / 100.0) - expected
        
        if deviation > 0:
            deviations.append((item, deviation))
            
    if not deviations:
        return None
        
    deviations.sort(key=lambda x: x[1], reverse=True)
    surprise_item, dev = deviations[0]
    
    label = surprise_item.get("label", surprise_item["type"])
    
    return {
        "type": surprise_item["type"],
        "label": label,
        "rupees": float(surprise_item["rupees"]),
        "line": f"Your {label.lower()} is {round(dev*100.0)} percentage points above what a typical home spends on it."
    }


def solar_payback(bill: Any, days: int, rate: float) -> Optional[Dict[str, Any]]:
    """Estimates residential solar stats and payback period."""
    units_consumed = getattr(bill, "units_consumed", None)
    if units_consumed is None and isinstance(bill, dict):
        units_consumed = bill.get("units_consumed")
        
    if not units_consumed or units_consumed <= 0 or days <= 0:
        return None

    annual_units = units_consumed * (365.0 / days)
    
    # size_kw bounded [1, 3]
    size_kw = max(SOLAR_MIN_KW, min(SOLAR_MAX_KW, round(annual_units / IRRADIANCE_KWH_PER_KW_YEAR)))
    
    gross = size_kw * COST_PER_KW
    subsidy = SUBSIDY_TABLE.get(size_kw, 78000)
    net = gross - subsidy
    
    generated = size_kw * IRRADIANCE_KWH_PER_KW_YEAR
    annual_saved = min(annual_units, generated) * rate
    
    if annual_saved <= 0:
        return None
        
    payback_years = net / annual_saved
    
    if payback_years > 15.0:
        return None
        
    return {
        "size_kw": float(size_kw),
        "coverage_percent": float(round(min(1.0, generated / annual_units) * 100.0)),
        "net_cost_rupees": float(net),
        "annual_saving_rupees": round(annual_saved, 2),
        "payback_years": round(payback_years, 1)
    }
