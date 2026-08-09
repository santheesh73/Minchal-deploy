# MINCHAL Architecture & Technical Design

## Architectural Philosophy: "Gemini Reads, Deterministic Engine Calculates, Gemini Explains"

MINCHAL is designed around a strict boundary between AI vision/text generation and deterministic energy calculation:

1. **Gemini AI**: Handles unstructured perception (reading photographed electricity bills & rating plates) and natural-language synthesis (explaining audit findings in English/Tamil).
2. **Deterministic Calculation Engine**: Python-based physics/mathematics engine that calculates kWh consumption, star rating adjustments, age factors, symptom penalties, bill normalization, and rupee allocations.
3. **React PWA**: A zero-AI client presentation layer that operates as an installable Progressive Web Application (PWA).

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    React + Vite PWA                         │
 │           (Presentation Layer · PWA · i18n)                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP API (JSON)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     FastAPI Backend                         │
 └──────┬───────────────────────┬───────────────────────┬──────┘
        │                       │                       │
        ▼                       ▼                       ▼
 ┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
 │ Bill Vision  │       │ Rating Plate │       │ Deterministic   │
 │ (Gemini OCR) │       │ (Gemini OCR) │       │ Energy Engine   │
 └──────────────┘       └──────────────┘       └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Explanation AI  │
                                               │ (Gemini Synthesis│
                                               └─────────────────┘
```

---

## Core Components

### 1. Frontend (React 18 + Vite 5 + TypeScript + Tailwind CSS)
- **State Management**: Centralized `AuditContext` and reducer for bill state, appliance inventory, and audit results.
- **PWA Features**: Service worker (`dist/sw.js`), web manifest, offline detection banner, responsive design.
- **Zero AI SDKs**: The client never calls Gemini APIs directly or exposes secret keys.

### 2. Backend API (FastAPI + Pydantic + Uvicorn)
- **Endpoints**: `/api/extract-bill`, `/api/extract-nameplate`, `/api/manual-bill`, `/api/analyze`, `/api/plan-budget`, `/health`.
- **Validation**: Strict Pydantic schemas enforcing numeric ranges and mandatory parameters.
- **Resilience**: Automatic multi-model fallback chain for Gemini requests.

### 3. Deterministic Engine (`backend/engine/`)
- `calculator.py`: Evaluates duty-cycle and on-demand wattage, applies star/age/symptom multipliers, scales to actual bill consumption, and ranks appliances by rupee impact.
- `actions.py`: Generates free, low-cost, and investment recommendations based on identified inefficiency symptoms.
- `tables.py`: Lookup tables for standard appliance wattages, duty cycles, star multipliers, and maintenance costs.

---

## Privacy & Security Model
- **Zero PII Storage**: Consumer names, account numbers, and addresses are deliberately excluded from extraction and storage schemas.
- **Server-Side Credentials**: `GEMINI_API_KEY` is maintained strictly inside backend environment variables.
