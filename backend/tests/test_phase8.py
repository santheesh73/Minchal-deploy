"""Phase 8 — manual-entry kill switch (POST /api/manual-bill).

The PRD fallback for when OCR accuracy is not good enough to demo. Its whole
value is that it works when extraction does not, so these tests pin the two
properties the frontend depends on: same validation gate, same response shape.
"""
import os
import sys
import json
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from schemas import BillData

client = TestClient(app)

VALID = {
    "units_consumed": 620,
    "total_amount": 4800,
    "billing_days": 61,
    "tariff_slab": "LT-1A",
}


def test_manual_bill_happy_path():
    res = client.post("/api/manual-bill", json=VALID)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["units_consumed"] == 620.0
    assert data["total_amount"] == 4800.0
    assert data["billing_days"] == 61
    assert data["tariff_slab"] == "LT-1A"


def test_manual_bill_response_shape_matches_extraction():
    """The frontend swaps one endpoint for the other, so the keys must match."""
    manual = client.post("/api/manual-bill", json=VALID).json()
    extracted = client.post(
        "/api/extract-bill",
        files={"image": ("b.png", b"dummy", "image/png")},
    ).json()

    assert set(manual) == set(extracted), (
        f"shape drift — manual-only: {set(manual) - set(extracted)}, "
        f"extract-only: {set(extracted) - set(manual)}"
    )
    # and it must satisfy the locked contract model the engine consumes
    BillData(**manual)


def test_manual_bill_feeds_analyze():
    """End to end: the kill switch output must drive /api/analyze unchanged."""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(base, "mocks", "analyze_request.json"), encoding="utf-8") as f:
        payload = json.load(f)

    payload["bill"] = client.post("/api/manual-bill", json=VALID).json()
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200, res.text
    assert res.json()["ok"] is True


def test_manual_bill_applies_the_same_validation_gate():
    # billing_days outside 15-95
    bad = dict(VALID, billing_days=5)
    res = client.post("/api/manual-bill", json=bad)
    assert res.status_code == 400
    assert res.json()["reason"] == "INVALID_BILL"

    # implied rate outside 2-20 per kWh (typo: 100 units for Rs 4800)
    bad = dict(VALID, units_consumed=100)
    res = client.post("/api/manual-bill", json=bad)
    assert res.status_code == 400
    assert res.json()["reason"] == "INVALID_BILL"

    # units above the supported ceiling
    bad = dict(VALID, units_consumed=5001, total_amount=30000)
    res = client.post("/api/manual-bill", json=bad)
    assert res.status_code == 400
    assert res.json()["reason"] == "INVALID_BILL"


def test_manual_bill_zero_units_is_a_typo_not_a_wrong_document():
    # same mapping as extraction: a bare zero is unreadable/mistyped
    res = client.post("/api/manual-bill", json=dict(VALID, units_consumed=0))
    assert res.status_code == 400
    assert res.json()["reason"] == "OCR_MISSING_FIELD"


def test_manual_bill_rejects_missing_fields_with_422():
    res = client.post("/api/manual-bill", json={"units_consumed": 620})
    assert res.status_code == 422


def test_manual_bill_period_end_optional_but_always_returned():
    assert "period_end" in client.post("/api/manual-bill", json=VALID).json()
    supplied = client.post("/api/manual-bill", json=dict(VALID, period_end="30/06/2026")).json()
    assert supplied["period_end"] == "30/06/2026"


def test_manual_bill_works_without_gemini():
    """The kill switch exists for when Gemini is the thing that is broken."""
    import gemini.client as gclient

    def explode(*a, **k):
        raise AssertionError("manual-bill must not call Gemini")

    with patch.object(gclient, "get_client", explode), \
         patch.object(gclient, "call_with_fallback", explode):
        res = client.post("/api/manual-bill", json=VALID)
    assert res.status_code == 200


def test_manual_bill_stores_no_identifying_fields():
    """Privacy rule holds here too — no name/number/address may be accepted."""
    res = client.post("/api/manual-bill", json=dict(
        VALID, consumer_name="TEST CONSUMER", consumer_number="00000000000",
        address="1 TEST STREET",
    ))
    assert res.status_code == 200
    body = json.dumps(res.json()).lower()
    for leaked in ("test consumer", "00000000000", "test street"):
        assert leaked not in body, f"manual-bill echoed {leaked!r} back"


def test_manual_bill_error_copy_suits_typing_not_photography():
    """Reason codes match extraction; the human-readable copy must not tell a
    user who typed a number to retake a photo."""
    res = client.post("/api/manual-bill", json=dict(VALID, units_consumed=0))
    body = res.json()
    assert body["reason"] == "OCR_MISSING_FIELD"
    assert "photo" not in body["message"].lower()
    assert "picture" not in body["message"].lower()
