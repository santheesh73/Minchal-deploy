# Future Work

Deliberately out of scope for the 24-hour build. Each is architecturally
planned, not hand-waved.

## 1. Budget-constrained action planning

**What:** User enters an available budget (e.g. ₹5,000). System returns the
optimal set of actions maximising annual savings within that constraint.

**Why it's not a chatbot:** This is a knapsack problem, not a conversation.
We already compute `saves_rupees`, `payback_months`, and replacement costs
per action. Ranking by savings-per-rupee under a budget ceiling is
deterministic arithmetic — it belongs in `engine/actions.py`, not in an LLM.

**Why deferred:** Adding an unconstrained LLM surface would contradict our
core architectural claim that Gemini never produces a rupee figure. The
constrained explanation is our only AI output surface, by design.

## 2. Smart-home / IoT integration

**What:** Optional smart-plug or smart-meter ingestion for households that
have them, replacing estimation with measurement.

**Why deferred:** Our positioning is explicitly hardware-free — that's what
serves the 92% of Indian households without an AC, let alone a smart plug.
IoT is a later tier for users who already have hardware, not the entry path.

**Architecture note:** The engine already accepts a bill total as ground
truth and normalises against it. Metered per-appliance data would replace
the estimation layer while leaving insights, actions, and explanation
untouched — a clean substitution, not a rewrite.

## 3. Multi-bill trend tracking

Month-wise appliance trends and anomaly detection. Requires persistence
(Firestore) which was deliberately excluded from MVP scope.

## 4. Real LT-1A bill validation

No real consumption bill (with units, billing days, tariff slab printed)
has driven the full pipeline. Both real photos obtained were payment
receipts, correctly rejected. Documented in DEMO_NOTES.md.
