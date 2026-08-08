# Specification — Phase 3: Calculation Engine

This document details the mathematical models, formulas, normalisation steps, confidence metrics, and edge cases implemented in `backend/engine/calculator.py`.

---

## 1. Formulas & Derivations

The engine estimates energy consumption (kWh) over a given number of days.

### Baseline Age Factor
For all appliances, consumption increases as the unit ages:
$$\text{age\_f} = 1 + \text{AGE\_PER\_YEAR} \times \max(0, \text{CURRENT\_YEAR} - \text{year\_of\_manufacture})$$
* **AGE\_PER\_YEAR**: `0.015` (+1.5% per year)
* **CURRENT\_YEAR**: `2026`
* If `year_of_manufacture` is in the future, age is treated as `0` ($\text{age\_f} = 1.0$).

### Fault Factor Combination Rule
Multiple symptoms reported for a single appliance are combined using the **MAX** value of their multipliers:
$$\text{fault\_f} = \max(\{ \text{symptom\_multiplier}(s) \text{ for } s \text{ in symptoms} \}) \text{ (default: 1.0 if empty list)}$$
* **Rationale**: Multiplying multipliers (product rule) compounds overlapping effects exponentially (e.g. 1.30 * 1.30 * 1.17 = 1.97, meaning a doubling of energy usage). In reality, symptoms like "weak cooling" and "dirty filters" share underlying thermostatic run-time or compressor loads. Taking the maximum is a conservative, defensible boundary.

---

### Mode A: Duty-cycle Appliances (Refrigerator)
Fridges are always plugged in and cycle continuously. Star ratings directly dictate base daily draw:
$$\text{raw\_kwh} = \text{FRIDGE\_KWH\_DAY}[\text{star}] \times \text{age\_f} \times \text{fault\_f} \times \text{days}$$
* **STAR\_MULT**: **NOT APPLIED** to refrigerators because the base rating in `FRIDGE_KWH_DAY` already accounts for efficiency. Applying it again would double-count efficiency gains.

### Mode B: On-demand Appliances (All others)
$$\text{raw\_kwh} = \left(\frac{\text{watts}}{1000}\right) \times \text{hours} \times \text{duty} \times \text{STAR\_MULT}[\text{star}] \times \text{age\_f} \times \text{fault\_f} \times \text{days}$$
* **watts**: Estimated or default rated power in Watts from `DEFAULT_WATTS`.
* **hours**: Midpoint value of the reported `HoursBand` (from `HOURS_BAND`).
* **duty**: Thermostatic duty-cycle factor from `DUTY_CYCLE` (defaults to `1.0` if not in dictionary).
  * AC: `0.65` (compressor cycles)
  * Geyser: `0.90` (standby heat retention + elements)
  * Others: `1.00`
* **STAR\_MULT**: Efficiency scaling multiplier (from `STAR_MULT`).

---

## 2. Normalisation / Calibration

Since raw user estimates are subjective, the sum of estimates rarely matches the actual billing units. The bill total is our **anchor of truth**.
1. Calculate raw estimate for each appliance.
2. Estimate unmeasured background load (other):
   $$\text{other\_raw} = \text{OTHER\_SHARE} \times \text{bill.units\_consumed}$$
3. Compute total raw consumption:
   $$\text{total} = \sum(\text{appliance\_raw}) + \text{other\_raw}$$
4. Calculate normalisation scale factor:
   $$\text{scale} = \frac{\text{bill.units\_consumed}}{\text{total}}$$
5. Multiply all estimates (including other) by `scale`. Append the normalisation step to each appliance's `working[]` array.
6. Determine average tariff rate:
   $$\text{rate} = \frac{\text{bill.total\_amount}}{\text{bill.units\_consumed}}$$
7. Assign cost:
   $$\text{rupees} = \text{units} \times \text{rate}$$
8. Sort final breakdown in descending order of rupees. The `"other"` category is forced to rank last.

---

## 3. Confidence Metrics

Confidence represents data quality and input completeness:
$$\text{confidence} = \text{round}(\text{ocr} \times \text{runtime} \times \text{scale\_q} \times 100)$$

1. **OCR Completeness (`ocr`)**:
   * Fraction of non-null bill fields present in `BillData` (out of expected fields: `units_consumed`, `total_amount`, `billing_days`, `period_end`, `tariff_slab`).
2. **Runtime Completeness (`runtime`)**:
   * Fraction of Mode B appliances with `hours_band` specified. Mode A (fridges) do not need runtimes and are excluded from the denominator.
3. **Scale Quality (`scale_q`)**:
   * `1.0` if $0.85 \le \text{scale} \le 1.15$
   * `0.7` if $0.70 \le \text{scale} \le 1.40$
   * `0.4` otherwise.

Returns the final confidence score and exactly 3 ticked reasons (`Assumption` objects).

---

## 4. Edge Cases

| Case | Required Behaviour |
|---|---|
| `units_consumed == 0` or `None` | Return `ApiError` with code `INVALID_BILL` (status code 400) |
| `appliances == []` | Breakdown consists of `other` only (100%), confidence low |
| `hours_band is None` on Mode B | Use default band `"4-6"` (midpoint 5.0), mark assumption `ok=False` |
| `total == 0` before scaling | Return `ApiError` with code `SERVER_ERROR` |
| `scale` outside 0.4–2.5 | Return result, do not clamp, flag confidence low |
| `star` outside 1–5 | Clamp to nearest valid star rating (1 or 5) |
| `year` in the future | Treat age as 0 |
| Unknown symptom key | Ignore, multiplier defaults to 1.0 |
| Unknown appliance type | Return `ApiError` with code `APPLIANCE_UNKNOWN` |

---

## 5. Worked Example (Hand-Calculation)

**Input AC details**:
* Capacity/Tonnage: `1.5T`
* Star rating: `3`
* Manufacture Year: `2017`
* Hours band: `"6-8"` (Midpoint = 7.0 hours)
* Symptoms: `[]` (None)
* Days: `61`

**Steps**:
1. **Watts mapping**: `1.5` capacity maps to `"ac_1.5t"` -> `1500` W = `1.5` kW.
2. **Hours midpoint**: `"6-8"` midpoint = `7.0` hours.
3. **Duty cycle**: AC duty cycle = `0.65`.
4. **Star multiplier**: 3-star multiplier = `1.00`.
5. **Age Factor**:
   * Age = $2026 - 2017 = 9$ years
   * $\text{age\_f} = 1 + 0.015 \times 9 = 1.135$
6. **Fault Factor**: No symptoms -> `1.0`.
7. **Raw Estimate**:
   $$\text{raw} = 1.5 \times 7.0 \times 0.65 \times 1.00 \times 1.135 \times 1.0 \times 61 = 472.4936 \approx 472.5\text{ kWh}$$
