# MINCHAL Security & Responsible AI Policy

## 🔒 Security Principles

### 1. Server-Side Secret Isolation
- `GEMINI_API_KEY` is strictly maintained in backend environment variables (`backend/.env`).
- No API keys or sensitive credentials are ever exposed through `VITE_*` variables, client-side bundles, or HTML markup.

### 2. Zero PII Data Collection
- Consumer name, account/service number, home address, and financial details are **deliberately excluded** from extraction schemas and log outputs.
- Photographed bill images are processed in memory and never stored in persistent databases.

### 3. Build & Container Security
- `.gitignore` and `.dockerignore` strictly prevent `.env` files, virtual environments (`.venv`), `__pycache__`, `.pytest_cache`, and un-sanitized test assets from entering git repositories or Docker image layers.

---

## 🤖 Responsible AI Policy

1. **Non-Hallucinatory Financial Math**: Gemini AI is never permitted to invent rupee values or calculate bill totals directly. All financial math is computed deterministically by the Python calculation engine.
2. **Transparent AI Usage**: Gemini is used exclusively for bill image OCR, rating plate reading, and natural-language synthesis of audit results.
3. **Disclaimers & Limits**: Audit findings represent physics-based estimations for energy saving opportunities and are not professional electrical engineering diagnoses or smart-meter certified measurements.
