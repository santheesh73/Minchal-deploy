import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Add parent directory to path to import gemini and schemas
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import BillData, NameplateData
from gemini.validate import validate_bill, validate_nameplate, GeminiValidationError
from gemini.cache import clear_caches, get_cached_bill, set_cached_bill
from gemini.extract import extract_bill, extract_nameplate

def test_privacy():
    # Privacy rule: parsed BillData has no name/consumer/address/phone/email fields
    model_fields = BillData.model_fields.keys()
    forbidden = ["name", "consumer", "address", "phone", "email"]
    for f in model_fields:
        for forbid in forbidden:
            assert forbid not in f.lower(), f"Forbidden field '{forbid}' found in BillData model field '{f}'"

def test_validation_bill_missing_units():
    # units_consumed is null -> OCR_MISSING_FIELD
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": None, "total_amount": 1000, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"

def test_validation_bill_invalid_units():
    # units_consumed > 5000 -> INVALID_BILL
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 5001, "total_amount": 1000, "billing_days": 30})
    assert exc.value.reason == "INVALID_BILL"

    # units_consumed == 0 -> OCR_MISSING_FIELD, NOT INVALID_BILL. Gemini emits 0
    # when the figure is unreadable, so zero is far more often "couldn't read it"
    # than "genuinely not a bill", and the guidance differs materially: retake
    # the photo vs go find a different document.
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 0, "total_amount": 1000, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"

def test_validation_bill_missing_total():
    # total_amount is null or <= 0 -> OCR_MISSING_FIELD
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 200, "total_amount": None, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"
    
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 200, "total_amount": 0, "billing_days": 30})
    assert exc.value.reason == "OCR_MISSING_FIELD"

def test_validation_bill_invalid_days():
    # billing_days < 15 or > 95 -> INVALID_BILL
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 200, "total_amount": 1000, "billing_days": 14})
    assert exc.value.reason == "INVALID_BILL"
    
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 200, "total_amount": 1000, "billing_days": 96})
    assert exc.value.reason == "INVALID_BILL"

def test_validation_bill_implied_rate():
    # implied rate (total/units) outside 2 to 20 -> INVALID_BILL
    # units=100, total=50000 -> rate 500 -> INVALID_BILL
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 100, "total_amount": 50000, "billing_days": 30})
    assert exc.value.reason == "INVALID_BILL"
    
    # units=1000, total=500 -> rate 0.5 -> INVALID_BILL
    with pytest.raises(GeminiValidationError) as exc:
        validate_bill({"units_consumed": 1000, "total_amount": 500, "billing_days": 30})
    assert exc.value.reason == "INVALID_BILL"

def test_validation_nameplate_power():
    # rated_power_w outside 20-5000 -> set to null
    res = validate_nameplate({"rated_power_w": 10, "star_rating": 3.0, "manufacture_year": 2020})
    assert res["rated_power_w"] is None
    
    res = validate_nameplate({"rated_power_w": 6000, "star_rating": 3.0, "manufacture_year": 2020})
    assert res["rated_power_w"] is None

def test_validation_nameplate_star():
    # star_rating outside 1-5 -> set to null
    res = validate_nameplate({"rated_power_w": 1500, "star_rating": 6.0, "manufacture_year": 2020})
    assert res["star_rating"] is None
    
    res = validate_nameplate({"rated_power_w": 1500, "star_rating": 0.5, "manufacture_year": 2020})
    assert res["star_rating"] is None

def test_validation_nameplate_year():
    # manufacture_year < 1990 or > CURRENT_YEAR -> set to null
    res = validate_nameplate({"rated_power_w": 1500, "star_rating": 3.0, "manufacture_year": 1989})
    assert res["manufacture_year"] is None
    
    res = validate_nameplate({"rated_power_w": 1500, "star_rating": 3.0, "manufacture_year": 2027})
    assert res["manufacture_year"] is None

@patch("gemini.extract.get_client")
@patch("gemini.extract.call_with_fallback")
def test_malformed_json_failure(mock_fallback, mock_get_client):
    # Gemini returns malformed JSON -> OCR_BLUR, does not raise standard parse error
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    # Mock response with malformed JSON
    mock_response = MagicMock()
    mock_response.text = "this is not JSON"
    mock_fallback.return_value = mock_response
    
    # Temporarily force MOCK_MODE = False in extract module
    with patch("gemini.extract.MOCK_MODE", False):
        with pytest.raises(GeminiValidationError) as exc:
            extract_bill(b"test_image_bytes")
        assert exc.value.reason == "OCR_BLUR"

@patch("gemini.extract.get_client")
@patch("gemini.extract.call_with_fallback")
def test_cache_hits(mock_fallback, mock_get_client):
    # Cache: same bytes twice -> one API call (mock client, assert call count)
    clear_caches()
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.text = '{"units_consumed": 200, "total_amount": 1000, "billing_days": 30, "period_end": "2026-08-01", "tariff_slab": "LT-1A"}'
    mock_fallback.return_value = mock_response
    
    with patch("gemini.extract.MOCK_MODE", False):
        img_bytes = b"identical_image_bytes_here"
        
        # First call: cache miss, calls client
        res1 = extract_bill(img_bytes)
        assert res1["units_consumed"] == 200.0
        assert mock_fallback.call_count == 1
        
        # Second call: cache hit, doesn't call client
        res2 = extract_bill(img_bytes)
        assert res2["units_consumed"] == 200.0
        assert mock_fallback.call_count == 1

def test_mock_mode_active():
    # MOCK_MODE returns valid mock without touching network
    with patch("gemini.extract.MOCK_MODE", True):
        # Even if get_client is not mocked, it won't hit network
        res = extract_bill(b"dummy")
        assert res["units_consumed"] == 620.0
        assert res["total_amount"] == 4800.0
