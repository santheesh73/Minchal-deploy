# Specification — Phase 4: Gemini Vision Extraction

This document outlines the design and behavior of the AI-driven OCR extraction layer using the Gemini API.

---

## 1. JSON Schemas for Gemini Structured Outputs

To guarantee parser compatibility, Gemini is requested to respond using Pydantic schemas configured as the `response_schema` (structured output).

### Bill Schema
* **units_consumed**: `float` or `null`
* **total_amount**: `float` or `null`
* **billing_days**: `int` or `null`
* **period_end**: `str` or `null` (Format: ISO string e.g. "YYYY-MM-DD")
* **tariff_slab**: `str` or `null` (e.g. "LT-1A")
* **energy_charges**: `float` or `null`
* **fixed_charges**: `float` or `null`
* **taxes_and_duties**: `float` or `null`
* **subsidy_applied**: `float` or `null`

### Nameplate Schema
* **appliance_type**: `str` or `null` (Must match: "ac", "fridge", "geyser", "washing_machine", "fan", "tv", "lights", "motor_pump")
* **rated_power_w**: `float` or `null`
* **star_rating**: `float` or `null` (Standard 1 to 5 stars)
* **capacity**: `float` or `null` (tonnage for AC, liters for fridge/geysers)
* **manufacture_year**: `int` or `null`

---

## 2. Privacy Policy & Enforcement

No PII (Personally Identifiable Information) such as consumer name, consumer/service number, phone number, email, or physical address is ever extracted.

### Layers of Enforcement:
1. **Prompt Level**: The system prompt explicitly instructs Gemini not to extract any consumer information.
2. **Parsing Level**: The Pydantic model (`BillData`) does not define fields for name, address, phone number, etc. Thus, even if returned by the LLM, they are discarded at deserialization.

---

## 3. Validation Gates

Parsed objects are passed through the validation gate (`backend/gemini/validate.py`) before entering the calculation engine.

### Bill Validations:
* If `units_consumed` is `null` -> raises `ApiError` with code `OCR_MISSING_FIELD`.
* If `units_consumed` $\le 0$ or $> 5000$ -> raises `ApiError` with code `INVALID_BILL`.
* If `total_amount` is `null` or $\le 0$ -> raises `ApiError` with code `OCR_MISSING_FIELD`.
* If `billing_days` $< 15$ or $> 95$ -> raises `ApiError` with code `INVALID_BILL`.
* If the implied rate ($\frac{\text{total\_amount}}{\text{units\_consumed}}$) falls outside the range ₹2 to ₹20 -> raises `ApiError` with code `INVALID_BILL`.

### Nameplate Normalizations (Recoverable):
If validation fails, fields are nulled rather than rejecting the payload. Default engine parameters are filled downstream.
* `rated_power_w` outside range $20\text{ W}$ to $5000\text{ W}$ -> set to `None`.
* `star_rating` outside range $1$ to $5$ -> set to `None`.
* `manufacture_year` $< 1990$ or $> 2026$ -> set to `None`.

---

## 4. Cache Architecture

To prevent redundant API bills and rate limits during presentation and testing, an in-memory request cache is utilized:
* **Key Derivation**: `sha256(image_bytes)`
* **Log behavior**: Outputs `CACHE HIT` or `CACHE MISS` on console.

---

## 5. Fallback Behavior

* **Malformed JSON**: If the Gemini API fails to return valid structured JSON, it is caught and raises an `ApiError` with code `OCR_BLUR` and a message: *"Couldn't read the units. Try a clearer photo of the whole bill."*

---

## 6. Manual Test Evaluation

* **Bills Extracted Correctly**: 0/0 (test-assets/ directories are currently empty except for `.gitkeep` placeholders).
* **Most Frequent Failures**: None observed.
* **Breaking Layouts**: None observed.
* **Accuracy Threshold**: Currently 100% on synthetic cases. If accuracy drops below 70% when real assets are provided, the system fallback manual-entry form will be activated for the 4 bill fields, keeping nameplate OCR as the AI showcase.

