# The Ragnarok · Tech for Good 2026 - Minchal

Team repository for **Build with AI: Code for Communities** — GDG Coimbator
(hackathon **Aug 8–9, 2026**, GRD College).  

Everything ur team does lives here from day one: the proposal, code, docs, and
progress. Organizers follow along through this repo, so keep it active.

## Start 
1. **Fill in [`PROPOSAL.md`](./PROPOSAL.md)** and commit it by **Jul 24, 11:59 PM IST**. That's your Ideation-Phase submission.
2. **Add your teammates** as collaborators (Settings → Collaborators), or ask your organizer to add them by GitHub username.
3. **Build in the open** — commit early and often. Put source in `/src`, notes and diagrams in `/docs`.

## Minchal - 24-hour hackathon project for energy bill analysis.

## Team Roles
- **FE-1**: Capture flow (BillCapture, AppliancePicker)
- **FE-2**: Result screen (ResultScreen)
- **BE-1**: Gemini extraction (prompts & parsing)
- **BE-2**: Calculation engine & insights

## API Contract is LOCKED
All frontend components are built against the mock JSON and types in `frontend/src/types/api.ts`.
**Do not change the API contract without agreement from all four team members.**

## Backend status

Live URL (quick Cloudflare tunnel — **expires without warning, re-check before
every rehearsal**): `https://crown-greg-all-governor.trycloudflare.com`

Before any demo or rehearsal:
```bash
cd backend && python scripts/preflight.py
```

> **Known limitation:** the `DEMO_MODE` fallback cache is built on a **synthetic**
> bill, not a real one (`PLACEHOLDER_DATA = True` in `backend/demo_cache.py`).
> The numbers in it are real engine output, but the source bill is generated.
> Both real bills obtained so far are payment receipts, which print no billing
> period and so cannot reach the engine. See
> [`backend/DEMO_NOTES.md`](./backend/DEMO_NOTES.md) for what this means and the
> ~10-minute procedure to close it once a standard LT-1A consumption bill exists.

Fallbacks if something breaks live: `POST /api/manual-bill` (type the numbers,
no Gemini call) and `DEMO_MODE=true` (serves a known-good cached response).
Details in [`backend/DEMO_NOTES.md`](./backend/DEMO_NOTES.md).

## Quickstart

**Frontend**
```bash
cd frontend
npm install
USE_MOCKS=true npm run dev
```

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```
