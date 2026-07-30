# The Ragnarok

**Tech for Good 2026** · GDG Coimbatore · Build weekend Aug 8–9, GRD College

**Track:** AI for Sustainable Cities & Climate Action
**Team code:** TEAM-014

## Problem

Household electricity bills in India report a total and a slab breakdown, but never attribution. Meena can't see which appliance drove her bill up — so she either pays it or guesses.

We're focusing on the AC specifically, for three reasons. It's the largest single household load — cooling accounts for about 40% of residential electricity use (CLASP–BEE, n=4,321, 20 states, 2024). It's the most volatile, which is what makes bills jump unpredictably between cycles. And it's the most decision-relevant: AC ownership sits near 8% of Indian households, and the India Cooling Action Plan projects roughly 40% by 2038 — around 130 million purchase decisions in the next decade, most made on sticker price because lifetime running cost isn't computable at the point of sale.

Non-intrusive load monitoring has existed since Hart (1992), but it assumes a smart meter producing high-frequency load data. In the no-meter regime — which is most Indian households — people are left with generic heuristics that never touch their actual bill.

The weekend-scoped question: can a photographed bill, one appliance nameplate, and a single tap produce an attribution estimate accurate enough that the person it's about believes it and acts on it?

## Who it helps

Meena — a homeowner in Coimbatore with a family TNEB connection, an AC bought a few years ago, and a bill that jumped last cycle with no explanation. One of our own family connections matches this profile exactly, and she's who we're building for and testing with.

Beyond Meena, the same need holds across lower- and middle-income Tamil Nadu households, where the bill is a meaningful fraction of monthly income and a wrong AC purchase locks in a decade of cost.

## Solution

Minchal (மின்சாரம், "electricity"). For the hackathon: bill photo → AC nameplate photo → one tap → one number.

Everything from our earlier scope — full appliance inventory, bounded QP solver, Monte Carlo confidence intervals, multi-cycle tracking — is real future work, sequenced below, but not what we're building this weekend.

What Meena does
Photograph the bill. Camera opens directly on mobile; file upload on desktop.
Photograph the AC nameplate. We show a reference image of what a nameplate looks like, since most people have never deliberately looked at one.
One tap: how long does the AC run daily?
[2–4 hrs] [4–6 hrs] [6–8 hrs] [8+ hrs]
Pre-selected to the published average for her AC's star rating and tonnage — so this is a correction, not a required input. Skipping it costs nothing; engaging with it buys real accuracy.
See the result within 90 seconds.

Why we reversed our earlier cut on this tap. Runtime is the single largest error term in the calculation. Rated power comes off the nameplate accurately, billing days come off the bill exactly, the star multiplier is a lookup. Runtime is the one input we'd otherwise be guessing, and it varies from 2 hours a night to 10 in a Coimbatore summer — a fixed assumption could be off by 3×, which means the headline number could be off by 3×. The build cost is one component, one state variable, and one lookup change: roughly 20 minutes. We cut things that were expensive relative to their value; this is cheap relative to enormous value.

How it works

Gemini call #1 — extraction. Structured output mode (JSON schema, not free text) pulls fields from both photos:

From the bill: units consumed, total amount, billing period days, tariff slab
From the nameplate: rated power (W), star rating, tonnage, inverter or fixed-speed

Validation gate before any arithmetic. Is units plausible? Is rated_power_w in AC range (~800–3000W)? Did Gemini flag the image as partially obscured? If any check fails, we ask for a retake rather than guessing. A bad extraction silently feeding a bad calculation is worse than a 10-second retake.

The calculation — deterministic, not Gemini.

python
runtime_hours   = user_tap OR RUNTIME_TABLE[star_rating][tonnage]
efficiency      = STAR_MULTIPLIER[star_rating]
daily_kwh       = (rated_power_w / 1000) * runtime_hours * efficiency
cycle_kwh       = daily_kwh * billing_days
ac_units        = min(cycle_kwh, 0.9 * units_billed)   # capped
ac_rupees       = ac_units * (bill_total / units_billed)

RUNTIME_TABLE and STAR_MULTIPLIER are small lookup tables built once from published BEE and industry averages. The 90% cap prevents an impossible result; when it triggers, the UI says "your AC likely accounts for a large share of this bill, though we can't be precise without more detail" rather than showing a suspicious round number.

Gemini call #2 — explanation. The solved numbers are passed back in as fixed inputs, with an explicit instruction to use only those figures and introduce no others. Gemini writes the plain-Tamil-or-English explanation and one concrete recommendation.

The architectural boundary, stated plainly: Gemini call #1 turns pixels into numbers. The calculation turns numbers into other numbers, deterministically. Gemini call #2 turns numbers into sentences. Gemini never bridges pixels directly to rupees — there is always a deterministic step in between. That's the safety property of the system, and we've kept it intact even at minimum scope, because this is a tool people make spending decisions from and plausible-sounding is exactly the failure mode to avoid.

What we cut, and why
Full appliance inventory → AC only. One appliance done credibly beats five done as guesses.
Bounded QP solver → fixed formula. The QP's value was letting the bill-total constraint correct multiple unknowns simultaneously. With one appliance there's nothing to jointly solve.
Monte Carlo confidence → a stated range. Real confidence estimation needs real usage data to calibrate against. We don't have it yet.
Firestore persistence → stateless session. No accounts for the hackathon build.
Validation, weekend scope

Compare the estimate against Meena's real bill and her own sense of her AC usage. The test is simple and it's the right one: does the number feel plausible to the person it's about? Formal plug-meter validation and rank-agreement testing is next-phase work.

Deployment — getting this to real users

Week 1 after the hackathon: share the link directly in 2–3 Coimbatore residential and apartment WhatsApp groups we already belong to through family and neighbours. No app store, no marketing — just the tool in front of 30–50 households who already trust the person sharing it. This is the same channel that already carries every neighbourhood's practical advice, so it's a distribution route that already works for trust-based tools.

How we measure return usage without accounts. On first visit, localStorage writes a timestamp and an anonymous random ID. On a later visit, we fire a single analytics event recording days-since-first and, more importantly, whether they completed a second bill photo — because "came back and used it" is a far stronger signal than "opened the page again."

Stated limitation: localStorage doesn't survive a cleared browser or a device switch, so this undercounts. At a sample of 30–50 households we're looking for a directional signal, not a retention curve, and we'll report it as such.

The low-tech complement: because we're distributing through groups we're personally in, we can simply ask. "Did you try it? Did you check again this month?" A dozen direct answers from people we know beats a clean analytics number from strangers at this scale.

The success signal we care about: do people return for a second bill cycle unprompted. If they do, the estimate was plausible and useful. If they don't, it wasn't — and no amount of technical sophistication fixes that.

## Architecture

React PWA — installable on mobile, responsive on desktop
  (camera capture on mobile; camera or upload on desktop)
        ↓
  [1] Bill photo  →  [2] Nameplate photo  →  [3] Runtime tap (pre-filled)
        ↓
Cloud Run backend (FastAPI)
        ↓
GEMINI CALL #1 — structured extraction (JSON schema)
  bill: units, total, days, slab
  nameplate: rated_power, star, tonnage, type
        ↓
VALIDATION GATE — plausibility checks; retake prompt on failure
        ↓
CALCULATION ENGINE (Python, deterministic)
  runtime × power × efficiency × days, capped at 90% of bill
        ↓
GEMINI CALL #2 — explanation + one recommendation
  (solved numbers passed as fixed inputs; no new figures permitted)
        ↓
React frontend — result rendered, localStorage return-tracking flag set

## Tech stack

React (PWA — installable mobile + responsive web), Gemini API, Cloud Run  Future phases add: Firebase/Firestore, Python/SciPy solver, Open-Meteo, Google Earth Engine, Google Maps Platform.

## Getting started

1. Accept your collaborator invite (check your email / GitHub notifications).
2. Clone this repo and start building.
3. Commit early and often — this repo is what you present on the day.

---

_Created automatically when your proposal was validated._