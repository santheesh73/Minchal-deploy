def fault_factor(symptoms):
    """Return max of matched multipliers, never product. Default 1.0."""
    return 1.0

def estimate(appliance, days):
    """Fridge uses FRIDGE_KWH_DAY (Mode A); everything else watts/1000 * hours * star * age * fault * days (Mode B)."""
    pass

def analyze(bill, appliances):
    """Raw estimates + other = OTHER_SHARE * units, then normalise: scale = units_consumed / total, multiply all by scale."""
    pass

def confidence(ocr, runtime, scale_quality):
    """Returns (percent, three_reason_ticks)."""
    return (100, [])
