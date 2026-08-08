"""Phase 9 — DEMO_MODE safety net.

The net has to be safe in both directions: it must serve the demo bill when a
rate limit would otherwise break a re-run, and it must NEVER serve one bill's
numbers for a different bill.
"""
import os
import sys
import json
import importlib
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import demo_cache
import main
from main import app

client = TestClient(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def demo_payload():
    with open(os.path.join(BASE_DIR, "mocks", "analyze_request.json"), encoding="utf-8") as f:
        payload = json.load(f)
    payload["bill"] = json.loads(demo_cache.DEMO_BILL_JSON)
    return payload


def test_demo_mode_off_by_default():
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("DEMO_MODE", None)
        assert demo_cache.demo_mode_enabled() is False
        assert demo_cache.demo_response(json.loads(demo_cache.DEMO_BILL_JSON)) is None


@pytest.mark.parametrize("value,expected", [
    ("1", True), ("true", True), ("TRUE", True), ("yes", True), ("on", True),
    ("0", False), ("false", False), ("", False), ("no", False),
])
def test_demo_mode_env_parsing(value, expected):
    with patch.dict(os.environ, {"DEMO_MODE": value}):
        assert demo_cache.demo_mode_enabled() is expected


def test_cached_values_are_real_engine_output():
    """The whole point: the safety net must not contain invented numbers."""
    resp = json.loads(demo_cache.DEMO_RESPONSE_JSON)
    bill = json.loads(demo_cache.DEMO_BILL_JSON)

    units = sum(float(i["units"]) for i in resp["breakdown"])
    rupees = sum(float(i["rupees"]) for i in resp["breakdown"])
    assert abs(units - bill["units_consumed"]) <= 0.1
    assert abs(rupees - bill["total_amount"]) <= 1.0
    assert len(resp["confidence_reasons"]) == 3
    assert resp["explanation"].strip()


def test_cache_does_not_freeze_timing():
    """meta must reflect the request that actually happened, not a stale run."""
    frozen = json.loads(demo_cache.DEMO_RESPONSE_JSON)["meta"]
    assert "duration_ms" not in frozen, "stale duration would be reported as real"
    assert "generated_at" not in frozen


def test_demo_mode_serves_cache_for_the_demo_bill():
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        res = client.post("/api/analyze", json=demo_payload())
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["meta"]["duration_ms"] > 0
    assert data["meta"]["generated_at"]


def test_demo_mode_measures_timing_per_request():
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        p = demo_payload()
        d1 = client.post("/api/analyze", json=p).json()
        d2 = client.post("/api/analyze", json=p).json()
    assert d1["meta"]["duration_ms"] != d2["meta"]["duration_ms"], "timing is frozen, not measured"
    assert d1["meta"]["generated_at"] and d2["meta"]["generated_at"]


def test_demo_mode_ignores_a_different_bill():
    """A cache that serves the wrong bill's numbers is worse than no cache."""
    p = demo_payload()
    p["bill"] = dict(p["bill"], units_consumed=999.0, total_amount=7000.0)
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        res = client.post("/api/analyze", json=p)
    assert res.status_code == 200
    # falls through to the real path, so no cache marker
    assert "data_source" not in res.json()["meta"]


def test_demo_cache_hits_via_manual_bill_route():
    """The kill switch and the safety net must compose: the same bill typed by
    hand has to hit the same cache entry as the photographed one."""
    bill = json.loads(demo_cache.DEMO_BILL_JSON)
    typed = client.post("/api/manual-bill", json={
        "units_consumed": bill["units_consumed"],
        "total_amount": bill["total_amount"],
        "billing_days": bill["billing_days"],
        "tariff_slab": bill["tariff_slab"],
    }).json()
    assert demo_cache.bill_hash(typed) == demo_cache.DEMO_BILL_HASH


def test_placeholder_is_marked_in_the_response():
    """While the data is synthetic it must say so in the payload itself, not
    only in a comment nobody reads under demo pressure."""
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        data = client.post("/api/analyze", json=demo_payload()).json()
    if demo_cache.PLACEHOLDER_DATA:
        assert data["meta"]["data_source"] == "placeholder"
    else:
        assert data["meta"].get("data_source") in (None, "cached")


def test_response_still_satisfies_the_locked_contract():
    from schemas import AnalyzeResponse
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        data = client.post("/api/analyze", json=demo_payload()).json()
    AnalyzeResponse(**data)  # extra meta.data_source must not break validation


def test_bill_hash_is_insensitive_to_slab_case_and_float_form():
    a = {"units_consumed": 735, "total_amount": 5420, "billing_days": 61, "tariff_slab": "LT-1A"}
    b = {"units_consumed": 735.0, "total_amount": 5420.00, "billing_days": 61, "tariff_slab": " lt-1a "}
    assert demo_cache.bill_hash(a) == demo_cache.bill_hash(b)


def test_swap_procedure_is_documented_next_to_the_data():
    """Under demo pressure the swap must not require reading the whole module."""
    src = open(os.path.join(BASE_DIR, "demo_cache.py"), encoding="utf-8").read()
    assert "SWAP PROCEDURE" in src
    assert "PLACEHOLDER_DATA" in src
    assert "DELETE-ON-SWAP" in src
