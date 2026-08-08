"""Phase 13 — multiple appliances of one type, and user-defined appliances."""
import os
import sys
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from schemas import BillData, ApplianceInput
from engine.calculator import analyze as engine_analyze, CalculatorError
from engine.actions import generate_actions
from engine.insights import biggest_surprise
from engine.tables import aggregate_breakdown_by_type

client = TestClient(app)
BILL = BillData(units_consumed=735, total_amount=5420, billing_days=61,
                period_end="30/06/2026", tariff_slab="LT-1A")


def ac(i, **kw):
    base = dict(id=f"ac-{i}", type="ac", capacity=1.5, star=3, year=2020, hours_band="4-6")
    base.update(kw)
    return ApplianceInput(**base)


# --- multiple instances of one type ----------------------------------------

def test_two_of_the_same_type_get_separate_rows():
    r = engine_analyze(BILL, [ac(1), ac(2, capacity=1.0, star=4)])
    ac_rows = [b for b in r["breakdown"] if b["type"] == "ac"]
    assert len(ac_rows) == 2, "duplicates were merged away in the breakdown"


def test_arithmetic_still_exact_with_duplicates():
    r = engine_analyze(BILL, [ac(1), ac(2), ac(3)])
    assert abs(sum(b["units"] for b in r["breakdown"]) - BILL.units_consumed) <= 0.1
    assert abs(sum(b["rupees"] for b in r["breakdown"]) - BILL.total_amount) <= 1.0


def test_aggregate_helper_sums_rather_than_last_wins():
    breakdown = [
        {"type": "ac", "label": "AC", "units": 100.0, "rupees": 700.0, "percent": 20.0, "rank": 1},
        {"type": "ac", "label": "AC", "units": 50.0, "rupees": 350.0, "percent": 10.0, "rank": 3},
        {"type": "other", "label": "Other", "units": 20.0, "rupees": 140.0, "percent": 5.0, "rank": 4},
    ]
    merged = aggregate_breakdown_by_type(breakdown)
    assert merged["ac"]["rupees"] == 1050.0, "last-wins would have given 350"
    assert merged["ac"]["units"] == 150.0
    assert merged["ac"]["percent"] == 30.0
    assert merged["ac"]["rank"] == 1


def test_actions_credit_the_whole_household_spend_on_a_type():
    """REGRESSION: breakdown_by_type was last-wins, so a home with two ACs had
    its saving computed from only one of them."""
    breakdown = [
        {"type": "ac", "label": "AC", "units": 200.0, "rupees": 1500.0, "percent": 30.0, "rank": 1},
        {"type": "ac", "label": "AC", "units": 200.0, "rupees": 1500.0, "percent": 30.0, "rank": 2},
    ]
    apps = [ac(1, hours_band="6-8"), ac(2, hours_band="6-8")]
    acts = generate_actions(apps, breakdown, rate=7.37, days=61)
    free = [a for a in acts if a["tier"] == "free"]
    assert free, "no free action generated"
    # 22% of the COMBINED Rs 3000, not of Rs 1500
    assert free[0]["saves_rupees"] == pytest.approx(3000.0 * 0.22, abs=0.01)


def test_surprise_judges_a_type_by_its_combined_share():
    """Two ACs at 27% each are a household spending 54% on cooling. Judged one
    at a time, neither looks unusual and the finding vanishes."""
    breakdown = [
        {"type": "ac", "label": "AC", "units": 200.0, "rupees": 1500.0, "percent": 27.0, "rank": 1},
        {"type": "ac", "label": "AC", "units": 200.0, "rupees": 1500.0, "percent": 27.0, "rank": 2},
    ]
    s = biggest_surprise(breakdown)
    assert s is not None, "combined 54% AC share was not flagged"
    assert s["type"] == "ac"
    assert s["rupees"] == 3000.0


def test_endpoint_accepts_duplicate_types():
    payload = {"bill": json.loads(BILL.model_dump_json()),
               "appliances": [json.loads(a.model_dump_json()) for a in (ac(1), ac(2))]}
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200, res.text


# --- custom appliance -------------------------------------------------------

def custom(**kw):
    base = dict(id="cust-1", type="custom", star=3, year=2021, hours_band="2-4",
                rated_power_w=1200.0, label="Aquarium pump")
    base.update(kw)
    return ApplianceInput(**base)


def test_custom_appliance_uses_the_users_wattage():
    r = engine_analyze(BILL, [ac(1), custom()])
    row = [b for b in r["breakdown"] if b["type"] == "custom"][0]
    steps = {s["label"]: s["value"] for s in row["working"]}
    assert "1200" in steps["Rated Power"], f"did not use the supplied wattage: {steps['Rated Power']}"


def test_custom_appliance_without_wattage_is_rejected_not_guessed():
    """The whole point: there is no honest default wattage for a device we have
    never heard of, so we refuse rather than invent one."""
    with pytest.raises(CalculatorError) as exc:
        engine_analyze(BILL, [custom(rated_power_w=None)])
    assert exc.value.reason == "APPLIANCE_UNKNOWN"
    assert "wattage" in exc.value.message.lower()


def test_custom_appliance_with_zero_wattage_is_rejected():
    with pytest.raises(CalculatorError) as exc:
        engine_analyze(BILL, [custom(rated_power_w=0)])
    assert exc.value.reason == "APPLIANCE_UNKNOWN"


def test_custom_appliance_shows_the_users_own_label():
    r = engine_analyze(BILL, [custom(label="Aquarium pump")])
    row = [b for b in r["breakdown"] if b["type"] == "custom"][0]
    assert row["label"] == "Aquarium pump"


def test_custom_label_falls_back_when_blank():
    r = engine_analyze(BILL, [custom(label="   ")])
    row = [b for b in r["breakdown"] if b["type"] == "custom"][0]
    assert row["label"] == "Other appliance"


def test_custom_appliance_keeps_the_arithmetic_exact():
    r = engine_analyze(BILL, [ac(1), custom(), custom(id="cust-2", label="Server", rated_power_w=300.0)])
    assert abs(sum(b["units"] for b in r["breakdown"]) - BILL.units_consumed) <= 0.1
    assert abs(sum(b["rupees"] for b in r["breakdown"]) - BILL.total_amount) <= 1.0


def test_custom_endpoint_rejects_missing_wattage_with_400():
    """Must patch MOCK_MODE off: in MOCK_MODE /api/analyze returns canned data
    without ever running the engine, so the gate would never be reached and the
    test would pass while proving nothing."""
    from unittest.mock import patch
    import main as main_mod

    payload = {"bill": json.loads(BILL.model_dump_json()),
               "appliances": [json.loads(custom(rated_power_w=None).model_dump_json())]}
    with patch.object(main_mod, "MOCK_MODE", False),          patch("gemini.explain.generate_explanation", return_value="x"):
        res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400, res.text
    assert res.json()["reason"] == "APPLIANCE_UNKNOWN"


def test_existing_appliance_types_are_untouched():
    """Additive only — the eight catalogue members must all still validate."""
    for t in ("ac", "fridge", "geyser", "washing_machine", "fan", "tv", "lights", "motor_pump"):
        ApplianceInput(id=f"{t}-1", type=t, star=3, year=2020, hours_band="4-6")
