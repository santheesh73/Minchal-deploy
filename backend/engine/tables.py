FRIDGE_KWH_DAY = {1: 1.8, 2: 1.5, 3: 1.2, 4: 1.0, 5: 0.85}
DEFAULT_WATTS = {
    "ac_1.0t": 1100, "ac_1.5t": 1500, "ac_2.0t": 2000,
    "geyser_15l": 2000, "washing_machine": 500,
    "fan": 70, "tv": 90, "lights": 200, "motor_pump": 750,
}
HOURS_BAND = {"0-1": 0.5, "1-2": 1.5, "2-4": 3, "4-6": 5, "6-8": 7, "8+": 9}
STAR_MULT = {1: 1.20, 2: 1.10, 3: 1.00, 4: 0.90, 5: 0.82}
AGE_PER_YEAR = 0.015
CO2_PER_KWH = 0.71
OTHER_SHARE = 0.15

# F17 — fault symptoms. Midpoints of published ranges. Combine with MAX, never product.
SYMPTOMS = {
    "fridge": [("weak_cooling","Doesn't cool well",1.30), ("always_running","Runs almost all the time",1.60),
               ("ice_buildup","Thick ice in freezer",1.22), ("door_seal","Door seal loose",1.17),
               ("dirty_coils","Coils at back dusty",1.30)],
    "ac": [("not_cold","Room doesn't get cold",1.30), ("runs_continuously","Rarely switches off",1.45),
           ("dirty_filters","Filters dirty",1.22), ("low_gas","Cools poorly, may need gas",1.37),
           ("noise","Loud or strange noise",1.17)],
    "geyser": [("not_hot","Water not hot enough",1.35), ("never_off","Heating never switches off",2.00),
               ("leaking","Leaking from tank",1.40), ("scaled","Old / scaled element",1.25)],
    "washing_machine": [("not_clean","Clothes not clean",1.17), ("slow_cycle","Cycle much longer now",1.25),
                        ("no_drain","Water not draining",1.15)],
    "fan": [("slow","Slow even on high",1.25), ("hot_motor","Motor body very hot",1.27),
            ("noise","Humming / grinding",1.17)],
    "motor_pump": [("weak_flow","Weak flow at taps",1.25), ("long_run","Runs too long to fill",1.35),
                   ("short_cycle","Switches on/off often",1.17)],
    "lights": [("filament","Still using filament bulbs",5.00)],
}
TYPICAL_SHARE = {"ac":0.40,"fridge":0.18,"geyser":0.10,"washing_machine":0.05,
                 "fan":0.08,"tv":0.04,"lights":0.07,"motor_pump":0.08}

# F16 solar — Coimbatore constants. VERIFY SUBSIDY SLABS AT T+0.
IRRADIANCE_KWH_PER_KW_YEAR = 1450
COST_PER_KW = 60000
SUBSIDY_TABLE = {1: 30000, 2: 60000, 3: 78000}
