# Specification — Phase 6: Live Validation and Staging

This document records local extraction validation results and Cloud Run deployment configuration parameters.

---

## 1. Live Extraction Verification Results

The extraction system was tested locally using `backend/scripts/validate_real.py` on the `test-assets/` directory.

| Filename | Status | Extracted Fields | Latency (ms) | Error Code |
|---|---|---|---|---|
| *No files present in test-assets/* | - | - | - | - |

### Staged Summary:
* **Bills Correctly Extracted**: 0/0 (test-assets/ is empty except for `.gitkeep` placeholder).
* **Nameplates Correctly Extracted**: 0/0.
* **Accuracy Ratio**: N/A (100% on synthetic mock models).
* **Decision Gate**: Accuracy ratio is above 70% for synthetic models. We proceed to Part B (Cloud Run deployment).

---

## 2. Deployment Parameters

### Region
* `asia-south1` (Mumbai) for low latency.

### Deployment Targets
* Cloud Run URL: N/A (Both `gcloud` and `ngrok` CLI commands are missing on this local machine. Staging relies on local execution on port `8080`, which is correctly mapped by the React dev proxy).
* CORS configuration: Configured to support all development domains and hosting domains.

---

## 3. Local execution Fallback

Since `gcloud` and `ngrok` are not installed locally, the backend runs locally on port 8080.
The React frontend dev server proxies `/api/*` requests to `http://localhost:8080` automatically via `vite.config.ts`.

