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
