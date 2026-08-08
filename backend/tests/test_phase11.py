"""Phase 11 — bugs found by driving the real frontend end to end.

Every mock request had symptoms on every appliance and a hours_band on every
appliance. The real UI sends symptoms: [] when the user ticks nothing — the
common case — and that difference 500ed the entire analysis.
"""
import os
import sys
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from schemas import ApplianceInput, BillData
from engine.actions import generate_actions

client = TestClient(app)
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BILL = {
    "units_consumed": 735.0, "total_amount": 5420.0, "billing_days": 61,
    "period_end": "30/06/2026", "tariff_slab": "LT-1A",
    "energy_charges": None, "fixed_charges": None,
    "taxes_and_duties": None, "subsidy_applied": None,
}


def appliances(**overrides):
    base = [
        {"id": "ac-1", "type": "ac", "capacity": 1.5, "star": 3, "year": 2023,
         "hours_band": "6-8", "symptoms": []},
        {"id": "ref-1", "type": "fridge", "capacity": 250.0, "star": 3, "year": 2021,
         "hours_band": "8+", "symptoms": []},
    ]
    for a in base:
        a.update(overrides)
    return base


def test_no_symptoms_does_not_crash_the_engine():
    """REGRESSION: symptoms == [] is falsy. `getattr(a, x, None) or a.get(x)`
    fell through to .get() on a pydantic model and raised
    "'ApplianceInput' object has no attribute 'get'", 500ing /api/analyze.
    Ticking no symptoms is the DEFAULT user journey."""
    models = [ApplianceInput(**a) for a in appliances()]
    breakdown = [
        {"type": "ac", "label": "AC", "units": 400.0, "rupees": 3000.0, "percent": 55.0, "rank": 1},
        {"type": "fridge", "label": "Fridge", "units": 200.0, "rupees": 1500.0, "percent": 28.0, "rank": 2},
    ]
    actions = generate_actions(models, breakdown, rate=7.37, days=61)
    assert isinstance(actions, list)


def test_analyze_endpoint_with_no_symptoms():
    """The exact payload shape the real frontend sends."""
    res = client.post("/api/analyze", json={"bill": BILL, "appliances": appliances()})
    assert res.status_code == 200, res.text
    assert res.json()["ok"] is True


def test_analyze_with_null_hours_band():
    """hours_band=None is the other falsy trap in the same idiom."""
    apps = appliances()
    for a in apps:
        a["hours_band"] = None
    res = client.post("/api/analyze", json={"bill": BILL, "appliances": apps})
    assert res.status_code == 200, res.text


def test_analyze_with_star_zero():
    """star=0 is falsy too — it must not fall through to a dict lookup."""
    apps = appliances()
    for a in apps:
        a["star"] = 0
    res = client.post("/api/analyze", json={"bill": BILL, "appliances": apps})
    assert res.status_code in (200, 400, 422), res.text
    assert "has no attribute" not in res.text


def test_engine_accepts_dicts_and_models_identically():
    breakdown = [{"type": "ac", "label": "AC", "units": 400.0, "rupees": 3000.0,
                  "percent": 55.0, "rank": 1}]
    as_dicts = generate_actions(appliances(), breakdown, rate=7.37, days=61)
    as_models = generate_actions([ApplianceInput(**a) for a in appliances()],
                                 breakdown, rate=7.37, days=61)
    assert as_dicts == as_models


def test_no_symptoms_fixture_exists_and_is_symptom_free():
    """The fixture preflight uses must actually exercise the empty case."""
    path = os.path.join(BASE, "mocks", "analyze_request_no_symptoms.json")
    assert os.path.isfile(path), "preflight's no-symptoms fixture is missing"
    payload = json.load(open(path, encoding="utf-8"))
    assert payload["appliances"], "fixture has no appliances"
    for a in payload["appliances"]:
        assert a["symptoms"] == [], f"{a['id']} still carries symptoms — fixture proves nothing"
    assert any(a.get("hours_band") is None for a in payload["appliances"]), \
        "fixture should also cover the null hours_band trap"


def test_no_symptoms_fixture_drives_analyze():
    """The endpoint accepts it, and the ENGINE computes correctly on it.

    The endpoint is checked through the API (in MOCK_MODE it returns canned
    data, so only the status is meaningful there), and the arithmetic is
    checked against the real engine directly — that is the part that broke.
    """
    payload = json.load(open(os.path.join(BASE, "mocks", "analyze_request_no_symptoms.json"), encoding="utf-8"))

    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200, res.text

    from engine.calculator import analyze as engine_analyze
    bill = BillData(**payload["bill"])
    apps = [ApplianceInput(**a) for a in payload["appliances"]]
    result = engine_analyze(bill, apps)

    rupees = sum(i["rupees"] for i in result["breakdown"])
    units = sum(i["units"] for i in result["breakdown"])
    assert abs(rupees - bill.total_amount) <= 1.0
    assert abs(units - bill.units_consumed) <= 0.1

    # and the actions layer — the exact code that raised AttributeError
    acts = generate_actions(apps, result["breakdown"],
                            bill.total_amount / bill.units_consumed, bill.billing_days)
    assert isinstance(acts, list)


def test_stock_fixture_still_has_symptoms():
    """Guards the pair: if someone strips symptoms from the stock request, the
    symptom-driven code paths stop being covered by anything."""
    payload = json.load(open(os.path.join(BASE, "mocks", "analyze_request.json"), encoding="utf-8"))
    assert any(a["symptoms"] for a in payload["appliances"]), \
        "stock fixture lost its symptoms — the cheap-action path is now untested"


# ---------------------------------------------------------------------------
# runtime_confirmed — confidence must reflect who supplied the runtime
# ---------------------------------------------------------------------------

def _confidence_for(runtime_confirmed):
    from engine.calculator import confidence
    apps = [ApplianceInput(**dict(a, runtime_confirmed=runtime_confirmed))
            for a in appliances()]
    return confidence(BillData(**BILL), apps, scale=1.0)


def test_defaults_do_not_claim_confirmed_runtime():
    """REGRESSION: the frontend pre-fills hours_band on add, so "a value is
    present" was always true and confidence read 100% on a path where the user
    confirmed nothing — while the tick claimed runtime was entered, not
    assumed. Presence is not confirmation."""
    pct, reasons = _confidence_for(False)
    assert pct < 100, "assumed runtime must not score full confidence"
    assert reasons[1]["ok"] is False, "the runtime tick must read false when assumed"


def test_absent_flag_is_treated_as_unconfirmed():
    """None means not confirmed — never an assertion. Same convention as
    is_electricity_bill."""
    pct_none, reasons_none = _confidence_for(None)
    pct_false, _ = _confidence_for(False)
    assert pct_none == pct_false
    assert reasons_none[1]["ok"] is False


def test_confirming_runtime_raises_confidence():
    """The refinement beat: confirming runtime must measurably improve both the
    tick and the percentage."""
    low, low_reasons = _confidence_for(False)
    high, high_reasons = _confidence_for(True)
    assert high > low, f"confirming runtime did not raise confidence ({low} -> {high})"
    assert low_reasons[1]["ok"] is False
    assert high_reasons[1]["ok"] is True


def test_partial_confirmation_lands_between():
    """Refining ONE appliance should sit between the extremes.

    Uses two NON-fridge appliances on purpose: fridges are excluded from the
    runtime denominator, so a fridge cannot produce a partial state.
    """
    from engine.calculator import confidence
    two_mode_b = [
        {"id": "ac-1", "type": "ac", "capacity": 1.5, "star": 3, "year": 2023,
         "hours_band": "6-8", "symptoms": [], "runtime_confirmed": True},
        {"id": "gey-1", "type": "geyser", "capacity": 15.0, "star": 2, "year": 2024,
         "hours_band": "1-2", "symptoms": [], "runtime_confirmed": False},
    ]
    apps = [ApplianceInput(**a) for a in two_mode_b]
    mid, _ = confidence(BillData(**BILL), apps, scale=1.0)

    none_conf = [ApplianceInput(**dict(a, runtime_confirmed=False)) for a in two_mode_b]
    all_conf = [ApplianceInput(**dict(a, runtime_confirmed=True)) for a in two_mode_b]
    low, _ = confidence(BillData(**BILL), none_conf, scale=1.0)
    high, _ = confidence(BillData(**BILL), all_conf, scale=1.0)
    assert low < mid < high, f"expected {low} < {mid} < {high}"


def test_assumed_runtime_does_not_zero_out_confidence():
    """0% is as wrong as the old 100%: assumed runtime is not no information,
    and every estimate is still normalised against the real bill total."""
    from engine.calculator import RUNTIME_ASSUMED_FLOOR
    pct, _ = _confidence_for(False)
    assert pct >= 50, f"assumed runtime collapsed confidence to {pct}%"
    assert 0 < RUNTIME_ASSUMED_FLOOR < 1


def test_field_is_additive_and_optional():
    """The contract shape is locked: the field must never be required."""
    assert not ApplianceInput.model_fields["runtime_confirmed"].is_required()
    a = ApplianceInput(id="x", type="ac", star=3, year=2020, hours_band="4-6")
    assert a.runtime_confirmed is None


def test_confirmed_runtime_does_not_change_the_estimate():
    """It affects the CONFIDENCE claim only — the arithmetic must be identical."""
    from engine.calculator import analyze as engine_analyze
    bill = BillData(**BILL)
    a_false = [ApplianceInput(**dict(a, runtime_confirmed=False)) for a in appliances()]
    a_true = [ApplianceInput(**dict(a, runtime_confirmed=True)) for a in appliances()]
    r1, r2 = engine_analyze(bill, a_false), engine_analyze(bill, a_true)
    assert [i["rupees"] for i in r1["breakdown"]] == [i["rupees"] for i in r2["breakdown"]]
    assert r1["confidence_percent"] != r2["confidence_percent"]
