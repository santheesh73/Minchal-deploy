# --- Mode A: duty-cycle appliances (always on, cycling) ---
# kWh/day for a 200-300L refrigerator, by star rating. Star already
# encodes efficiency here, so STAR_MULT is NOT applied to fridges.
FRIDGE_KWH_DAY = {1: 1.8, 2: 1.5, 3: 1.2, 4: 1.0, 5: 0.85}

# --- Mode B: on-demand appliances (watts x hours) ---
DEFAULT_WATTS = {
    "ac_1.0t": 1100, "ac_1.5t": 1500, "ac_2.0t": 2000,
    "geyser_15l": 2000, "washing_machine": 500,
    "fan": 70, "tv": 90, "lights": 200, "motor_pump": 750,
}

HOURS_BAND = {"0-1": 0.5, "1-2": 1.5, "2-4": 3.0,
              "4-6": 5.0, "6-8": 7.0, "8+": 9.0}   # band midpoints

STAR_MULT = {1: 1.20, 2: 1.10, 3: 1.00, 4: 0.90, 5: 0.82}
DUTY_CYCLE = {
    "ac": 0.65,          # compressor cycles
    "geyser": 0.90,      # mostly on-demand heating, small standby cycling
}
DUTY_CYCLE_DEFAULT = 1.0
AGE_PER_YEAR = 0.015    # +1.5% consumption per year of age
CURRENT_YEAR = 2026
OTHER_SHARE = 0.15      # unlisted load as fraction of billed units
CO2_PER_KWH = 0.71      # kg CO2/kWh, India grid average

# --- F17 fault symptoms: (key, user_label, multiplier) ---
# Multipliers are MIDPOINTS of published fault-impact ranges.
# Combine with MAX, never product — see calculator.fault_factor().
SYMPTOMS = {
    "fridge": [
        ("weak_cooling",    "Doesn't cool well",            1.30),
        ("always_running",  "Runs almost all the time",     1.60),
        ("ice_buildup",     "Thick ice in freezer",         1.22),
        ("door_seal",       "Door seal loose",              1.17),
        ("dirty_coils",     "Coils at back dusty",          1.30),
    ],
    "ac": [
        ("not_cold",           "Room doesn't get cold",     1.30),
        ("runs_continuously",  "Rarely switches off",       1.45),
        ("dirty_filters",      "Filters dirty",             1.22),
        ("low_gas",            "Cools poorly, may need gas",1.37),
        ("noise",              "Loud or strange noise",     1.17),
    ],
    "geyser": [
        ("not_hot",   "Water not hot enough",        1.35),
        ("never_off", "Heating never switches off",  2.00),
        ("leaking",   "Leaking from tank",           1.40),
        ("scaled",    "Old / scaled element",        1.25),
    ],
    "washing_machine": [
        ("not_clean",  "Clothes not clean",     1.17),
        ("slow_cycle", "Cycle much longer now", 1.25),
        ("no_drain",   "Water not draining",    1.15),
    ],
    "fan": [
        ("slow",      "Slow even on high",   1.25),
        ("hot_motor", "Motor body very hot", 1.27),
        ("noise",     "Humming / grinding",  1.17),
    ],
    "motor_pump": [
        ("weak_flow",   "Weak flow at taps",       1.25),
        ("long_run",    "Runs too long to fill",   1.35),
        ("short_cycle", "Switches on/off often",   1.17),
    ],
    "lights": [
        ("filament", "Still using filament bulbs", 5.00),
    ],
}

# Typical share of an Indian household bill by appliance (CLASP-BEE 2024).
# Used ONLY by F12 biggest_surprise deviation calculation.
TYPICAL_SHARE = {
    "ac": 0.40, "fridge": 0.18, "geyser": 0.10, "washing_machine": 0.05,
    "fan": 0.08, "tv": 0.04, "lights": 0.07, "motor_pump": 0.08,
}
TYPICAL_SHARE_DEFAULT = 0.05

# Display labels — single source of truth, used in breakdown[].label
LABELS = {
    "ac": "Air Conditioner", "fridge": "Refrigerator",
    "geyser": "Water Heater", "washing_machine": "Washing Machine",
    "fan": "Fan", "tv": "Television", "lights": "Lights",
    "motor_pump": "Water Pump", "other": "Lights, fans & others",
}

# --- F16 solar, Coimbatore. VERIFY SUBSIDY SLABS BEFORE DEMO ---
IRRADIANCE_KWH_PER_KW_YEAR = 1450   # typical TN generation per kW installed
COST_PER_KW = 60000                 # Rs, rooftop residential, installed
SUBSIDY_TABLE = {1: 30000, 2: 60000, 3: 78000}   # PM Surya Ghar
SOLAR_MIN_KW, SOLAR_MAX_KW = 1, 3   # residential band
REPLACEMENT_COST = {
    "ac": 38000,
    "fridge": 28000,
    "geyser": 9000
}



def watts_key(appliance_type: str, capacity: float | None) -> str:
    """Map (type, capacity) -> DEFAULT_WATTS key. AC uses nearest tonnage
    from {1.0, 1.5, 2.0}; geyser is always geyser_15l; others use type."""
    if appliance_type == "ac":
        cap = capacity if capacity is not None else 1.5
        # Find nearest tonnage
        tonnages = [1.0, 1.5, 2.0]
        nearest = min(tonnages, key=lambda x: abs(x - cap))
        return f"ac_{nearest:.1f}t"
    elif appliance_type == "geyser":
        return "geyser_15l"
    else:
        return appliance_type


def symptom_multiplier(appliance_type: str, symptom_key: str) -> float:
    """Return multiplier for a symptom key, or 1.0 if unknown.
    Never raise — an unknown symptom must not break an analysis."""
    if appliance_type not in SYMPTOMS:
        return 1.0
    for key, _, mult in SYMPTOMS[appliance_type]:
        if key == symptom_key:
            return mult
    return 1.0
