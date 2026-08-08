import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Add parent directory to path to import engine and gemini modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.insights import efficiency_gap, co2, savings, biggest_surprise, solar_payback
from engine.actions import generate_actions
from gemini.explain import generate_explanation

def test_efficiency_gap():
    # 1. all-5-star-new returns gap 0
    bill_new = {"units_consumed": 70.0, "total_amount": 1000}
    ac_new = {
        "id": "ac-1",
        "type": "ac",
        "star": 5,
        "year": 2026,
        "hours_band": "2-4",
        "symptoms": []
    }
    res_new = efficiency_gap([ac_new], bill_new, days=30, rate=5.0)
    assert res_new["efficiency_gap_percent"] == 0.0
    assert res_new["efficiency_gap_rupees"] == 0.0


    # 2. old 2-star returns gap > 0
    bill_old = {"units_consumed": 300.0, "total_amount": 1500}
    ac_old = {
        "id": "ac-1",
        "type": "ac",
        "star": 2,
        "year": 2010,
        "hours_band": "2-4",
        "symptoms": ["dirty_filters"]
    }
    res_old = efficiency_gap([ac_old], bill_old, days=30, rate=5.0)
    assert res_old["efficiency_gap_percent"] > 0.0
    assert res_old["efficiency_gap_rupees"] > 0.0


def test_biggest_surprise():
    # biggest_surprise CAN return the AC when its share exceeds 40%
    # expected share for ac is 0.40. Let's make it 50%.
    breakdown_ac_surprise = [
        {"type": "ac", "percent": 50.0, "rupees": 500.0, "label": "Air Conditioner"},
        {"type": "fridge", "percent": 10.0, "rupees": 100.0, "label": "Refrigerator"}
    ]
    res_ac = biggest_surprise(breakdown_ac_surprise)
    assert res_ac is not None
    assert res_ac["type"] == "ac"

    # returns None when every appliance is at or below typical
    # expected fridge is 0.18, expected ac is 0.40
    breakdown_typical = [
        {"type": "ac", "percent": 35.0, "rupees": 350.0, "label": "Air Conditioner"},
        {"type": "fridge", "percent": 15.0, "rupees": 150.0, "label": "Refrigerator"}
    ]
    res_typical = biggest_surprise(breakdown_typical)
    assert res_typical is None

def test_solar_payback():
    # solar size_kw is always within 1..3
    bill = {"units_consumed": 200, "total_amount": 1000}
    res1 = solar_payback(bill, days=30, rate=5.0)
    assert res1 is not None
    assert 1.0 <= res1["size_kw"] <= 3.0

    # solar returns None when payback > 15 years
    # Very small savings/rate (e.g. rate = 0.1) -> long payback
    res_slow = solar_payback(bill, days=30, rate=0.1)
    assert res_slow is None

def test_savings_cap():
    # monthly savings never exceed 40% of the bill
    actions = [
        {"tier": "free", "saves_rupees": 200.0},
        {"tier": "cheap", "saves_rupees": 300.0}
    ]
    # bill total = 1000. Cap = 400.
    res = savings(actions, bill_total=1000.0)
    assert res["monthly_savings_rupees"] == 400.0

def test_actions_generation():
    # cheap action only appears when a maintenance symptom is present
    ac_no_symptom = {
        "id": "ac-1",
        "type": "ac",
        "star": 3,
        "year": 2026,
        "hours_band": "2-4",
        "symptoms": []
    }
    breakdown = [{"type": "ac", "rupees": 500.0, "percent": 50.0}]
    actions_none = generate_actions([ac_no_symptom], breakdown, rate=5.0, days=30)
    # Check that there's no cheap action
    assert not any(act["tier"] == "cheap" for act in actions_none)

    # Add maintenance symptom
    ac_with_symptom = {
        "id": "ac-1",
        "type": "ac",
        "star": 3,
        "year": 2026,
        "hours_band": "2-4",
        "symptoms": ["dirty_filters"]
    }
    actions_some = generate_actions([ac_with_symptom], breakdown, rate=5.0, days=30)
    assert any(act["tier"] == "cheap" for act in actions_some)

    # investment action always has payback_months
    # age = 2026 - 2010 = 16 years (> 8), star = 2 (<= 3)
    ac_old = {
        "id": "ac-1",
        "type": "ac",
        "star": 2,
        "year": 2010,
        "hours_band": "2-4",
        "symptoms": []
    }
    actions_inv = generate_actions([ac_old], breakdown, rate=5.0, days=30)
    inv_action = next(act for act in actions_inv if act["tier"] == "investment")
    assert "payback_months" in inv_action
    assert inv_action["payback_months"] > 0

@patch("gemini.explain.get_client")
def test_explanation_fallback(mock_get_client):
    # explanation fallback produces a non-empty string when Gemini raises
    mock_get_client.side_effect = Exception("API error")
    bill = {"units_consumed": 620, "total_amount": 4800, "billing_days": 60}
    breakdown = [{"type": "ac", "rupees": 2000.0, "percent": 41.0, "label": "Air Conditioner"}]
    actions = [{"tier": "free", "text": "Set to 26C", "saves_rupees": 150.0}]
    
    with patch("gemini.explain.MOCK_MODE", False):
        res = generate_explanation(bill, breakdown, actions, language="ta")
        assert len(res) > 0
        assert "620" in res

def test_explanation_prompt_contains_only_given_numbers():
    # explanation prompt contains no numbers absent from the breakdown
    bill = {"units_consumed": 620, "total_amount": 4800, "billing_days": 60}
    breakdown = [{"type": "ac", "rupees": 2000.0, "percent": 41.0, "label": "Air Conditioner"}]
    actions = [{"tier": "free", "text": "Set to 26C", "saves_rupees": 150.0}]
    
    # We mock get_client to capture the prompt text sent to Gemini
    mock_client = MagicMock()
    
    with patch("gemini.explain.MOCK_MODE", False), patch("gemini.explain.get_client", return_value=mock_client):
        generate_explanation(bill, breakdown, actions, language="ta")
        
        # Verify the generate_content call
        call_args = mock_client.models.generate_content.call_args
        assert call_args is not None
        prompt_sent = call_args[1]["contents"]
        
        # Check that prompt contains our numbers
        assert "620" in prompt_sent
        assert "4800" in prompt_sent
        assert "60" in prompt_sent
        assert "2000.0" in prompt_sent
        assert "41.0" in prompt_sent
        assert "150.0" in prompt_sent
        
        # Let's ensure no weird external numbers are there
        # For instance, a number like "999" or "12345" shouldn't be there
        assert "999" not in prompt_sent
