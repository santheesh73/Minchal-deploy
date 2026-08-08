import os
import sys
import pytest

# Add parent directory to path to import engine and schemas
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.calculator import (
    fault_factor,
    estimate_kwh,
    build_assumptions,
    confidence,
    analyze,
    CalculatorError
)
from schemas import BillData, ApplianceInput

def test_hand_computed_ac():
    # AC: 1.5T, 3-star, year 2017, hours_band "6-8", no symptoms, days 61
    ac = {
        "id": "ac-1",
        "type": "ac",
        "capacity": 1.5,
        "star": 3,
        "year": 2017,
        "hours_band": "6-8",
        "symptoms": []
    }
    raw, steps = estimate_kwh(ac, days=61)
    # Expected: 472.4936... -> 472.5 kWh
    assert round(raw, 1) == 472.5

def test_ac_with_symptom():
    # same AC with symptoms=["runs_continuously"] -> raw = 472.5 * 1.45 = 685.2
    ac = {
        "id": "ac-1",
        "type": "ac",
        "capacity": 1.5,
        "star": 3,
        "year": 2017,
        "hours_band": "6-8",
        "symptoms": ["runs_continuously"]
    }
    raw, steps = estimate_kwh(ac, days=61)
    assert round(raw, 1) == 685.2

def test_fault_factor_combination():
    # fault_factor("fridge", ["weak_cooling","dirty_coils","door_seal"]) == 1.30 (max of 1.30, 1.30, 1.17)
    assert fault_factor("fridge", ["weak_cooling", "dirty_coils", "door_seal"]) == 1.30

def test_fridge_no_star_multiplier():
    # fridge estimate does NOT apply STAR_MULT
    # Mode A (fridge): base_kwh_day (1.2 for 3-star) * age_f * fault_f * days
    # If star multiplier (1.00 for 3-star) is mistakenly applied, it might match.
    # Let's test a 5-star fridge. Base is 0.85. Star mult for 5-star is 0.82.
    # Age factor = 1.0 (year=2026), fault = 1.0, days = 30.
    # Correct: 0.85 * 30 = 25.5
    # If Star Mult is applied: 0.85 * 0.82 * 30 = 20.91
    fridge = {
        "id": "fridge-1",
        "type": "fridge",
        "star": 5,
        "year": 2026,
        "symptoms": []
    }
    raw, steps = estimate_kwh(fridge, days=30)
    assert round(raw, 2) == 25.50

def test_analyze_convergence():
    bill = BillData(
        units_consumed=620.0,
        total_amount=4800.0,
        billing_days=61,
        period_end="2026-08-01",
        tariff_slab="domestic"
    )
    ac = ApplianceInput(
        id="ac-1",
        type="ac",
        capacity=1.5,
        star=3,
        year=2017,
        hours_band="6-8",
        symptoms=[]
    )
    fridge = ApplianceInput(
        id="fridge-1",
        type="fridge",
        star=3,
        year=2021,
        symptoms=["door_seal"]
    )
    appliances = [ac, fridge]
    
    result = analyze(bill, appliances)
    
    # after analyze(), sum(item.units) == bill.units_consumed within 0.1
    units_sum = sum(item["units"] for item in result["breakdown"])
    assert abs(units_sum - bill.units_consumed) <= 0.1
    
    # after analyze(), sum(item.rupees) == bill.total_amount within 1.0
    rupees_sum = sum(item["rupees"] for item in result["breakdown"])
    assert abs(rupees_sum - bill.total_amount) <= 1.0
    
    # scale_factor for a realistic 620-unit household lands in 0.7-1.4
    assert 0.7 <= result["scale_factor"] <= 1.4

    # every non-other breakdown item has a non-empty working[]
    for item in result["breakdown"]:
        if item["type"] != "other":
            assert len(item["working"]) > 0
            # the final working step is always the normalisation
            assert item["working"][-1]["label"] == "Final Calibrated Consumption"
            assert item["working"][-2]["label"] == "Normalisation Scale Factor"
        else:
            # other item has no working key
            assert "working" not in item
            assert "assumptions" not in item

    # confidence returns exactly 3 reasons, percent in 0-100
    assert len(result["confidence_reasons"]) == 3
    assert 0 <= result["confidence_percent"] <= 100

def test_edge_cases():
    # units_consumed == 0 or None -> raise CalculatorError INVALID_BILL
    with pytest.raises(CalculatorError) as exc:
        analyze({"units_consumed": 0, "total_amount": 4800, "billing_days": 60}, [])
    assert exc.value.reason == "INVALID_BILL"
    
    with pytest.raises(CalculatorError) as exc:
        analyze({"units_consumed": None, "total_amount": 4800, "billing_days": 60}, [])
    assert exc.value.reason == "INVALID_BILL"

    # appliances == [] -> breakdown is other only, 100%, confidence low
    bill = {"units_consumed": 620, "total_amount": 4800, "billing_days": 60, "period_end": "2026-08-01", "tariff_slab": "domestic"}
    res_empty = analyze(bill, [])
    assert len(res_empty["breakdown"]) == 1
    assert res_empty["breakdown"][0]["type"] == "other"
    assert res_empty["breakdown"][0]["percent"] == 100.0
    assert res_empty["confidence_percent"] <= 50.0

    # hours_band is None on Mode B -> use band "4-6" (midpoint 5.0), mark assumption ok=False
    ac_no_hours = {
        "id": "ac-1",
        "type": "ac",
        "capacity": 1.5,
        "star": 3,
        "year": 2026,
        "hours_band": None,
        "symptoms": []
    }
    raw, steps = estimate_kwh(ac_no_hours, days=30)
    # 1.5 kW * 5.0 hours * 0.65 duty * 1.0 star * 1.0 age * 1.0 fault * 30 days = 146.25 kWh
    assert round(raw, 2) == 146.25
    assumptions = build_assumptions(ac_no_hours)
    # Check if there is an ok=False runtime assumption
    runtime_ass = next(a for a in assumptions if "பயன்பாட்டு நேரம்" in a["text"])
    assert runtime_ass["ok"] is False

    # total == 0 -> raise CalculatorError SERVER_ERROR
    # If we have a geyser with 0 watts (or AC with capacity 0), wait, watts_key will still map to geyser_15l.
    # To get total == 0, we'd need billing_days == 0 or similar, but wait, the calculator checks if total == 0.
    # Let's test by mock calling or triggering days=0
    import engine.calculator
    original_share = engine.calculator.OTHER_SHARE
    engine.calculator.OTHER_SHARE = 0.0
    try:
        zero_bill = {"units_consumed": 620, "total_amount": 4800, "billing_days": 0, "period_end": "2026-08-01", "tariff_slab": "domestic"}
        ac_zero = {"id": "ac-1", "type": "ac", "star": 3, "year": 2026, "hours_band": "2-4"}
        with pytest.raises(CalculatorError) as exc:
            analyze(zero_bill, [ac_zero])
        assert exc.value.reason == "SERVER_ERROR"
    finally:
        engine.calculator.OTHER_SHARE = original_share


    # star outside 1-5 -> clamp
    ac_star_6 = {"id": "ac-1", "type": "ac", "star": 6, "year": 2026, "hours_band": "2-4"}
    raw_6, _ = estimate_kwh(ac_star_6, days=30)
    ac_star_5 = {"id": "ac-1", "type": "ac", "star": 5, "year": 2026, "hours_band": "2-4"}
    raw_5, _ = estimate_kwh(ac_star_5, days=30)
    assert raw_6 == raw_5

    # year in the future -> age = 0 (age_f = 1.0)
    ac_future = {"id": "ac-1", "type": "ac", "star": 3, "year": 2030, "hours_band": "2-4"}
    raw_future, _ = estimate_kwh(ac_future, days=30)
    ac_present = {"id": "ac-1", "type": "ac", "star": 3, "year": 2026, "hours_band": "2-4"}
    raw_present, _ = estimate_kwh(ac_present, days=30)
    assert raw_future == raw_present

    # unknown symptom key -> ignore, multiplier 1.0
    ac_bad_symptom = {"id": "ac-1", "type": "ac", "star": 3, "year": 2026, "hours_band": "2-4", "symptoms": ["unknown_symptom"]}
    raw_bad, _ = estimate_kwh(ac_bad_symptom, days=30)
    assert raw_bad == raw_present

    # unknown appliance type -> raise CalculatorError APPLIANCE_UNKNOWN
    ac_bad_type = {"id": "ac-1", "type": "microwave", "star": 3, "year": 2026, "hours_band": "2-4"}
    with pytest.raises(CalculatorError) as exc:
        analyze(bill, [ac_bad_type])
    assert exc.value.reason == "APPLIANCE_UNKNOWN"
