import os
import sys
import json
import pytest
from fastapi.testclient import TestClient

# Add parent directory to path to import app and schemas
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from schemas import AnalyzeResponse

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True, "version": "engine-1"}

def test_extract_bill():
    # Test valid image file
    # We can pass dummy content with image/png mimetype
    files = {"image": ("test.png", b"dummy_content", "image/png")}
    response = client.post("/api/extract-bill", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "units_consumed" in data
    assert "total_amount" in data

    # Test invalid file type
    files = {"image": ("test.txt", b"dummy_content", "text/plain")}
    response = client.post("/api/extract-bill", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["ok"] is False
    assert data["reason"] == "INVALID_BILL"

def test_extract_nameplate():
    # Test valid image file
    files = {"image": ("test.png", b"dummy_content", "image/png")}
    response = client.post("/api/extract-nameplate", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "appliance_type" in data

    # Test invalid file type
    files = {"image": ("test.txt", b"dummy_content", "text/plain")}
    response = client.post("/api/extract-nameplate", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["ok"] is False
    assert data["reason"] == "INVALID_BILL"

def test_analyze():
    # Load valid request payload
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(base_dir, "mocks", "analyze_request.json"), "r", encoding="utf-8") as f:
        payload = json.load(f)

    # First call
    response1 = client.post("/api/analyze", json=payload)
    assert response1.status_code == 200
    data1 = response1.json()

    # Validate against AnalyzeResponse model
    # Pydantic v2 validation via schema parsing
    try:
        AnalyzeResponse(**data1)
    except Exception as e:
        pytest.fail(f"AnalyzeResponse validation failed: {e}")

    # Second call (to check duration difference)
    response2 = client.post("/api/analyze", json=payload)
    assert response2.status_code == 200
    data2 = response2.json()

    # check duration_ms differs
    dur1 = data1["meta"]["duration_ms"]
    dur2 = data2["meta"]["duration_ms"]
    assert dur1 != dur2

    # check breakdown sum percentages sum to 100 (+- 1)
    percentages = [item["percent"] for item in data1["breakdown"]]
    assert abs(sum(percentages) - 100.0) <= 1.0

    # check rupees sum to bill_total_rupees (+- 5)
    rupees = [item["rupees"] for item in data1["breakdown"]]
    bill_total = data1["bill_total_rupees"]
    assert abs(sum(rupees) - bill_total) <= 5.0

    # the other item has no working key (or it is None / missing)
    other_item = next(item for item in data1["breakdown"] if item["type"] == "other")
    assert other_item.get("working") is None

    # malformed analyze body returns 422
    malformed_payload = {"bill": {}, "appliances": []}
    response_err = client.post("/api/analyze", json=malformed_payload)
    assert response_err.status_code == 422
