# Specification — Phase 2: Lookup Tables

This document outlines the lookup tables and helper methods in `backend/engine/tables.py` used by the calculations engine.

## Tables and Constants

### 1. FRIDGE_KWH_DAY
* **Description**: Daily energy consumption in kWh for a typical 200-300L domestic refrigerator, categorized by star rating. Star efficiency is pre-calculated into this base, so star multiplier must NOT be applied downstream.
* **Type**: `Dict[int, float]` (Key: Star Rating 1-5, Value: kWh/day)
* **Status**: **PUBLISHED** (Standard BEE appliance ratings average)
* **Error Handling**: Missing rating throws KeyError.

### 2. DEFAULT_WATTS
* **Description**: Standard electrical load in Watts for typical appliances.
* **Type**: `Dict[str, float]`
* **Status**: **ESTIMATES** (Representative values for Indian homes)
* **Error Handling**: Missing key throws KeyError.

### 3. HOURS_BAND
* **Description**: Map hour range bands to their numerical midpoint values.
* **Type**: `Dict[str, float]`
* **Status**: **ESTIMATES** (Midpoints of range categories)
* **Error Handling**: Missing key throws KeyError.

### 4. STAR_MULT
* **Description**: Scaling multiplier applied to baseline appliance consumption based on star rating.
* **Type**: `Dict[int, float]`
* **Status**: **PUBLISHED** (CLASP / BEE average relative efficiency)
* **Error Handling**: Missing rating throws KeyError.

### 5. AGE_PER_YEAR
* **Description**: Annual efficiency degradation coefficient (+1.5% per year of age).
* **Type**: `float`
* **Status**: **ESTIMATES**
* **Unit**: Fraction

### 6. CURRENT_YEAR
* **Description**: Year baseline used to compute appliance age (2026).
* **Type**: `int`

### 7. OTHER_SHARE
* **Description**: Unmeasured load (standby, minor appliances) as a percentage of overall units consumed.
* **Type**: `float`
* **Status**: **ESTIMATES** (Default baseline share: 15%)
* **Unit**: Fraction

### 8. CO2_PER_KWH
* **Description**: Carbon intensity factor of India's electricity grid.
* **Type**: `float`
* **Status**: **PUBLISHED** (CEA India Grid Emission factor 2024: 0.71 kg CO2/kWh)
* **Unit**: kg CO2/kWh

### 9. SYMPTOMS
* **Description**: Map of potential appliance fault symptom keys to their display labels and consumption multipliers.
* **Type**: `Dict[str, List[Tuple[str, str, float]]]`
* **Status**: **ESTIMATES** (Impact ranges compiled from field guides)

### 10. TYPICAL_SHARE & TYPICAL_SHARE_DEFAULT
* **Description**: Average consumption share of home electrical load by appliance type (CLASP-BEE 2024). Used for surprise detection calculations.
* **Type**: `Dict[str, float]`
* **Status**: **PUBLISHED** (BEE surveys)

### 11. LABELS
* **Description**: Display names for appliances, used as single source of truth for breakdowns.
* **Type**: `Dict[str, str]`

### 12. SOLAR CONSTANTS
* **IRRADIANCE_KWH_PER_KW_YEAR**: Typical generation in Coimbatore, TN (1450 kWh/kW/year). **PUBLISHED** (MNRE datasets).
* **COST_PER_KW**: Typical installed cost of residential rooftop solar (Rs 60,000). **ESTIMATES**.
* **SUBSIDY_TABLE**: National solar subsidy levels (PM Surya Ghar scheme). Rs 30,000 for 1kW, 60,000 for 2kW, 78,000 for 3kW. **PUBLISHED**.
* **SOLAR_MIN_KW / SOLAR_MAX_KW**: Minimum and maximum sizes for standard residential rooftop installations (1 to 3 kW).

---

## Helper Functions

### `watts_key(appliance_type: str, capacity: float | None) -> str`
Maps an appliance type and optional capacity to the corresponding key in `DEFAULT_WATTS`.
* **AC**: Map capacity to nearest tonnage in `{1.0, 1.5, 2.0}` (e.g. `1.4` -> `"ac_1.5t"`).
* **Geyser**: Defaults to `"geyser_15l"`.
* **Others**: Maps directly to the appliance type string.

### `symptom_multiplier(appliance_type: str, symptom_key: str) -> float`
Retrieves the multiplier associated with the given symptom key for the specified appliance.
* If either the appliance or the symptom key is not found, returns `1.0` (does not raise an exception).
