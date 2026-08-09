# MINCHAL API Reference Specification

## Overview
The MINCHAL REST API is served by FastAPI on port `8080`. All endpoints return JSON payloads and handle structured error codes.

---

## Health Check Endpoint

### `GET /health`
Returns system status and calculation engine version.

**Response (HTTP 200)**:
```json
{
  "ok": true,
  "version": "engine-1"
}
```

---

## Bill & Appliance Extraction Endpoints

### `POST /api/extract-bill`
Extracts numerical electricity bill data from a photographed bill image.

**Request**: `multipart/form-data` with `file` (JPEG, PNG, WebP or PDF).

**Response (HTTP 200)**:
```json
{
  "ok": true,
  "units_consumed": 350.0,
  "total_amount": 2400.0,
  "billing_days": 60,
  "tariff_category": "LT-1A Domestic",
  "confidence_percent": 95.0
}
```

---

### `POST /api/manual-bill`
Manual fallback endpoint when image OCR is unavailable.

**Response (HTTP 200)**: Same schema as `POST /api/extract-bill`.

---

## Energy Audit Endpoint

### `POST /api/analyze`
Runs the deterministic calculation engine and returns itemized consumption, efficiency gap, actionable recommendations, CO2 impact, and rooftop solar payback.

**Request Schema**:
```json
{
  "bill": {
    "units_consumed": 350.0,
    "total_amount": 2400.0,
    "billing_days": 60,
    "tariff_category": "LT-1A Domestic"
  },
  "appliances": [
    {
      "id": "ac-1",
      "type": "ac",
      "star": 3,
      "year": 2022,
      "hours_band": "4-8",
      "symptoms": ["dirty_filters"]
    }
  ],
  "language": "en"
}
```

**Response (HTTP 200)**:
```json
{
  "ok": true,
  "bill_total_rupees": 2400.0,
  "breakdown": [
    {
      "appliance_id": "ac-1",
      "type": "ac",
      "label": "Air Conditioner",
      "units_kwh": 204.5,
      "rupees": 1403.0,
      "percent": 58.4
    }
  ],
  "actions": [
    {
      "tier": "cheap",
      "appliance_type": "ac",
      "text": "Clean AC air filters and check refrigerant gas pressure.",
      "saves_rupees": 210.0,
      "cost_rupees": 800.0
    }
  ],
  "explanation": "Air Conditioner accounts for 58.4% of your electricity bill...",
  "insights": {
    "energy_score": 74,
    "co2_kg_year": 1512.0,
    "annual_savings_rupees": 4200.0
  }
}
```

---

## Budget Optimization Endpoint

### `POST /api/plan-budget`
Solves ROI knapsack optimization for actionable recommendations given a fixed rupee budget.

**Request Schema**:
```json
{
  "actions": [...],
  "budget_rupees": 1500.0,
  "language": "en"
}
```

**Response (HTTP 200)**:
```json
{
  "budget_rupees": 1500.0,
  "total_cost_rupees": 600.0,
  "budget_remaining_rupees": 900.0,
  "total_annual_saving_rupees": 2441.0,
  "selected": [...],
  "excluded": [...]
}
```
