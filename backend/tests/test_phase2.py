import os
import sys
import pytest

# Add parent directory to path to import engine and schemas
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.tables import (
    FRIDGE_KWH_DAY,
    DEFAULT_WATTS,
    HOURS_BAND,
    STAR_MULT,
    SYMPTOMS,
    TYPICAL_SHARE,
    LABELS,
    watts_key,
    symptom_multiplier
)

def test_symptom_multipliers_positive():
    # Every symptom multiplier is >= 1.0 (a fault never reduces consumption)
    for appliance_type, symptom_list in SYMPTOMS.items():
        for key, label, mult in symptom_list:
            assert mult >= 1.0, f"Multiplier for {appliance_type} -> {key} is less than 1.0: {mult}"

def test_symptom_keys_unique():
    # Every symptom key within an appliance type is unique
    for appliance_type, symptom_list in SYMPTOMS.items():
        keys = [item[0] for item in symptom_list]
        assert len(keys) == len(set(keys)), f"Duplicate symptom key found in {appliance_type}"

def test_fridge_kwh_day_decreasing():
    # FRIDGE_KWH_DAY is strictly decreasing as star rating rises (1 to 5)
    ratings = sorted(FRIDGE_KWH_DAY.keys())
    assert ratings == [1, 2, 3, 4, 5]
    for i in range(len(ratings) - 1):
        assert FRIDGE_KWH_DAY[ratings[i]] > FRIDGE_KWH_DAY[ratings[i+1]], \
            f"FRIDGE_KWH_DAY is not strictly decreasing at stars {ratings[i]} -> {ratings[i+1]}"

def test_star_mult_decreasing():
    # STAR_MULT is strictly decreasing as star rating rises (1 to 5)
    ratings = sorted(STAR_MULT.keys())
    assert ratings == [1, 2, 3, 4, 5]
    for i in range(len(ratings) - 1):
        assert STAR_MULT[ratings[i]] > STAR_MULT[ratings[i+1]], \
            f"STAR_MULT is not strictly decreasing at stars {ratings[i]} -> {ratings[i+1]}"

def test_typical_share_sum():
    # TYPICAL_SHARE values sum to <= 1.0
    total_share = sum(TYPICAL_SHARE.values())
    assert total_share <= 1.0, f"Total share {total_share} exceeds 1.0"

def test_keys_exist_in_labels():
    # Every key in TYPICAL_SHARE and SYMPTOMS exists in LABELS
    for key in TYPICAL_SHARE.keys():
        assert key in LABELS, f"TYPICAL_SHARE key {key} is missing in LABELS"
    for key in SYMPTOMS.keys():
        assert key in LABELS, f"SYMPTOMS key {key} is missing in LABELS"

def test_appliance_type_has_labels():
    # Every ApplianceType defined in schemas.py has a LABELS entry
    # ApplianceType = "ac"|"fridge"|"geyser"|"washing_machine"|"fan"|"tv"|"lights"|"motor_pump"
    appliance_types = ["ac", "fridge", "geyser", "washing_machine", "fan", "tv", "lights", "motor_pump"]
    for at in appliance_types:
        assert at in LABELS, f"ApplianceType {at} is missing in LABELS"

def test_watts_key():
    # AC nearest tonnage test
    assert watts_key("ac", 1.4) == "ac_1.5t"
    assert watts_key("ac", 0.8) == "ac_1.0t"
    assert watts_key("ac", 2.2) == "ac_2.0t"
    assert watts_key("ac", None) == "ac_1.5t"
    
    # Geyser defaults to geyser_15l
    assert watts_key("geyser", 25.0) == "geyser_15l"
    
    # Others use type
    assert watts_key("fan", None) == "fan"
    assert watts_key("washing_machine", 7.0) == "washing_machine"

def test_symptom_multiplier():
    # Known symptom
    assert symptom_multiplier("fridge", "door_seal") == 1.17
    
    # Unknown symptom / type returns 1.0 and does not raise
    assert symptom_multiplier("fridge", "nonsense_key") == 1.0
    assert symptom_multiplier("microwave", "door_seal") == 1.0
