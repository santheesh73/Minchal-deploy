# MINCHAL — Household Electricity Energy Audit Web Application / PWA

MINCHAL is a production-quality, responsive Progressive Web Application (PWA) for household electricity energy auditing. It parses DISCOM electricity bills, allows major appliance configuration with optional rating-plate photo OCR scanning, and visualizes comprehensive energy breakdowns, cost attributions, efficiency opportunity gaps, environmental CO₂ impacts, and solar rooftop options.

---

## 🌟 Key Architectural Principles

1. **Deterministic Backend Engine**: All energy math, cost attribution, unit calculations, efficiency gaps, and CO₂ metrics are computed strictly by the deterministic engine. The React frontend is purely a **presentation layer**.
2. **Zero Frontend AI Calls**: The frontend communicates strictly with the FastAPI backend endpoints and does **NOT** invoke Gemini or AI SDKs directly in browser client code.
3. **Strict Privacy**: Consumer name, account number, home address, or personal identifying bill information are **DELIBERATELY NEVER EXTRACTED** or stored.

---

## 📋 Milestone Completion Matrix

| Milestone | Scope & Deliverable | Status |
| :--- | :--- | :---: |
| **Milestone 1** | Foundation: Vite, React 18, TypeScript, Tailwind CSS, PWA, Router & State Architecture | **COMPLETE** ✓ |
| **Milestone 2** | Bill Capture & Extraction: Image compression, file validation, OCR scanning & bill confirmation | **COMPLETE** ✓ |
| **Milestone 3** | Appliance Selection & Config: 8 appliance types, BEE rating, year, runtime, symptoms & rating plate scan | **COMPLETE** ✓ |
| **Milestone 4** | Analysis Pipeline: `POST /api/analyze`, multi-stage progress loader, deduplication & error recovery | **COMPLETE** ✓ |
| **Milestone 5** | Audit Dashboard: Summary strip, appliance breakdown cards, efficiency gap, surprise, actions, CO₂, solar | **COMPLETE** ✓ |
| **Milestone 6** | Explainability & Trust: Data trust labels, working math steps, assumptions, confidence reasons, ErrorBoundary | **COMPLETE** ✓ |
| **Milestone 7** | Production Readiness & PWA: Health check API, PWA manifest, offline detection, 404/Error fallbacks | **COMPLETE** ✓ |

---

## 🚀 Technology Stack

- **Core**: React 18, TypeScript (strict mode), Vite 5, React Router DOM v6
- **Styling & Icons**: Tailwind CSS, Lucide React Icons
- **PWA Integration**: `vite-plugin-pwa`, Workbox, Web App Manifest
- **State Management**: React Context (`AuditContext`) & Reducer (`auditReducer`)
- **HTTP Client**: Centralized Fetch API Wrapper with Mock Fallback Engine

---

## 📁 Repository Folder Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.webmanifest
│   └── pwa-icon-192.png
├── src/
│   ├── api/                # API Client, Config, Endpoints & Health Check
│   │   ├── client.ts
│   │   ├── config.ts
│   │   ├── healthApi.ts
│   │   ├── billApi.ts
│   │   ├── nameplateApi.ts
│   │   └── analyzeApi.ts
│   ├── components/         # Atomic & Domain UI Component Suites
│   │   ├── ui/             # Atomic Design Tokens (Button, Card, Badge, Chip, Select, Modal, ProgressBar)
│   │   ├── layout/         # Responsive App Shell (Header, BottomNav, PageContainer)
│   │   ├── bill/           # Bill Upload & Confirmation Components
│   │   ├── appliances/     # Appliance Catalog, Form Selectors & Config Modal
│   │   ├── analysis/       # Multi-stage Progress Loader & Analysis Error Recovery
│   │   ├── audit/          # Dashboard Cards (Summary, Breakdown, Gap, Actions, CO2, Solar)
│   │   ├── explainability/ # Working Steps, Assumptions, Confidence Reasons & Trust Badges
│   │   └── shared/         # React ErrorBoundary
│   ├── config/             # Appliance Catalog Definitions & App Constants
│   ├── hooks/              # Custom Hooks (useBillExtraction, useNameplate, useAnalysis, useExplainability, useNetworkStatus)
│   ├── mocks/              # Offline Mock JSON Payloads (extract-bill, extract-nameplate, analyze)
│   ├── pages/              # Route Page Orchestrators (Home, BillUpload, Appliance, Analyzing, Audit, NotFound, Error)
│   ├── routes/             # React Router Setup (AppRoutes)
│   ├── store/              # AuditContext & auditReducer
│   ├── types/              # Locked API Interfaces & State Schemas
│   └── utils/              # Client Compression, Validation, Formatters, Mappers
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── vite.config.ts
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the `frontend` folder:

```bash
cp .env.example .env
```

Environment Flags:
- `VITE_API_BASE_URL`: Base URL of the backend server (e.g. `http://localhost:8080` or production domain).
- `VITE_USE_MOCKS`: Set to `true` for offline development using typed mock JSON responses; set to `false` to connect to live FastAPI backend.

---

## 🛠️ Local Development & Build Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Serves the application locally at `http://localhost:3000/`.

### Run TypeScript & Production Build
```bash
npm run build
```
Compiles TypeScript without errors and generates production-ready PWA bundle in `dist/`.

### Preview Production Build
```bash
npm run preview
```
Launches local web server previewing the static production bundle in `dist/`.

---

## 📱 PWA Features & Offline Capability

- **Installable**: Compatible with Chrome/Android, iOS Safari, and Desktop PWA installation.
- **Service Worker**: Auto-caches static shell assets, fonts, icons, and CSS bundles via Workbox (`dist/sw.js`).
- **Network Safety**: Automatically excludes POST API endpoints (`/api/extract-bill`, `/api/extract-nameplate`, `/api/analyze`) from caching.
- **Offline Banner**: Renders non-intrusive notification when `navigator.onLine` drops.

---

## 🔒 Security & Quality Assurance

- **No Secrets in Frontend**: `VITE_*` environment variables contain zero private credentials.
- **XSS Protection**: All API strings rendered safely as text without `dangerouslySetInnerHTML`.
- **Memory Management**: Canvas Object URLs cleaned up automatically via `URL.revokeObjectURL()`.
- **Duplicate Request Guards**: React Strict Mode request deduplication locks prevent double execution.
