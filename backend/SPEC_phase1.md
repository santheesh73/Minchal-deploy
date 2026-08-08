# API Specification — Phase 1

This document specifies the endpoints for Phase 1 of the Minchal backend. These endpoints return mock responses when `GEMINI_API_KEY` is not set.

## API Summary

- **Root URL**: `/`
- **Mocks Active**: `MOCK_MODE = not os.getenv("GEMINI_API_KEY")` (logged on startup)

---

## Endpoints

### 1. Health Check
* **Path**: `GET /health`
* **Request**: None
* **Response**: `200 OK`
  ```json
  {
    "ok": true,
    "version": "engine-1"
  }
  ```

### 2. Extract Bill
* **Path**: `POST /api/extract-bill`
* **Request**: Multipart Form Data
  * `image`: `UploadFile` (required)
* **Response**:
  * **Success (200 OK)**:
    ```json
    {
      "units_consumed": 200.0,
      "total_amount": 1000.0,
      "billing_days": 30,
      "period_end": "2023-10-01",
      "tariff_slab": "domestic",
      "energy_charges": 800.0,
      "fixed_charges": 100.0,
      "taxes_and_duties": 100.0,
      "subsidy_applied": 0.0
    }
    ```
  * **Failure (400 Bad Request)** (if file is not an image MIME type):
    ```json
    {
      "ok": false,
      "reason": "INVALID_BILL",
      "message": "Not an image file"
    }
    ```

### 3. Extract Nameplate
* **Path**: `POST /api/extract-nameplate`
* **Request**: Multipart Form Data
  * `image`: `UploadFile` (required)
* **Response**:
  * **Success (200 OK)**:
    ```json
    {
      "appliance_type": "ac",
      "rated_power_w": 1500.0,
      "star_rating": 3.0,
      "capacity": 1.5,
      "manufacture_year": 2020
    }
    ```
  * **Failure (400 Bad Request)**:
    ```json
    {
      "ok": false,
      "reason": "INVALID_BILL",
      "message": "Not an image file"
    }
    ```

### 4. Analyze Appliances
* **Path**: `POST /api/analyze`
* **Request**: `Content-Type: application/json`
  * Body: `AnalyzeRequest`
* **Response**:
  * **Success (200 OK)**: `AnalyzeResponse`
    * Includes `ok: true`
    * `bill_total_rupees`: Sum of breakdown rupees (e.g. ₹2400)
    * `breakdown`: Array of 4 elements (ac, fridge, geyser, other)
    * `scale_factor`
    * `confidence_percent` (87)
    * `confidence_reasons`
    * `meta`: Engine version, model, real-time duration_ms, and generated_at timestamp.
    * `explanation`
    * `actions`
    * `insights`
  * **Failure (422 Unprocessable Entity)**:
    * Standard FastAPI validation error if fields are missing or malformed.
  * **Failure (500 Internal Server Error)**:
    * Standard server error or `ApiError` with `"SERVER_ERROR"`.

---

## Error Codes and Envelopes

When a custom business error occurs (e.g. file uploaded is not an image), the API responds with:
* Status Code: `400 Bad Request` or relevant HTTP code
* Response body matching `ApiError`:
  ```json
  {
    "ok": false,
    "reason": "INVALID_BILL",
    "message": "Detailed explanation..."
  }
  ```

Valid `ErrorCode` values:
* `"OCR_BLUR"`
* `"OCR_MISSING_FIELD"`
* `"INVALID_BILL"`
* `"APPLIANCE_UNKNOWN"`
* `"SERVER_ERROR"`
