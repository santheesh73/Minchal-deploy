# Demo notes — read before the run-through

## Run this first, every time

```bash
python scripts/preflight.py
```

12 checks against the tunnel the frontend actually uses. Exit 0 or do not demo.

**Quick Cloudflare tunnels expire without warning.** One died mid-session today
while the `cloudflared` process was still running and looking healthy — the
hostname simply stopped resolving. Preflight catches this as its first check and
prints the restart command. Check before every rehearsal and again before the
real thing; never assume the URL from an hour ago is still live.

```bash
./cloudflared.exe tunnel --url http://localhost:8080
```
The URL changes on every restart. Re-post it to FE-1/FE-2 when it does.

---

## KNOWN LIMITATION: the DEMO_MODE cache is synthetic

`demo_cache.py` has **`PLACEHOLDER_DATA = True`**.

The cached response is **real engine output** — captured from a live
`/api/analyze` run, arithmetic invariants verified — but the bill it was
computed from is `test-assets/bills/synthetic_clean.png`, a generated fixture.
It is **not** a real photographed bill.

Every served cached response carries `meta.data_source: "placeholder"`, and the
server prints a warning banner at startup when `DEMO_MODE` is on. This is a
documented gap, not a silent one.

**Why it is still unresolved:** both real bills obtained so far are TANGEDCO
*payment receipts*, which print no `billing_days` and no tariff slab. Without a
billing period the engine has no denominator, and inventing one would put a
guessed number under every rupee figure in the breakdown — the one thing this
architecture exists to prevent. So they are correctly rejected, and the full
pipeline has never run on real extracted numbers.

**To close it** — about 10 minutes once a suitable bill exists:

1. Get a standard **LT-1A computer-printed consumption bill**, or a PDF from the
   TNPDCL portal. It must print units consumed, billing period dates *and*
   tariff slab. A payment receipt will not work.
   Portal: <https://www.tnebltd.gov.in/BillStatus/billstatus.xhtml> — needs the
   service connection number, the registered mobile number, and a CAPTCHA, so it
   has to be done by hand.
2. `python scripts/validate_real.py` — score it, add the row to
   `test-assets/bills/GROUND_TRUTH.md` (billing figures only, never the name or
   consumer number).
3. `python scripts/capture_demo.py --image ../test-assets/bills/<file>`
4. Paste the two JSON blocks into `demo_cache.py`, set `PLACEHOLDER_DATA = False`,
   delete the `DELETE-ON-SWAP` line.
5. `python scripts/preflight.py` — confirm 12/12 on real demo data.

---

## What has actually been proven on real bills

Two real TANGEDCO receipts, photographed handheld:

- reads **overprinted dot-matrix text** (`Units: 239` printed over the SAC-code
  line) that a human reader missed by eye
- **auto-rotation** recovers a sideways photo that otherwise lost
  `units_consumed` entirely
- returns **null rather than inventing** fields that are not printed
- the validation gate **correctly refuses** input the engine cannot use, with
  an accurate error rather than a fabricated answer

Two production bugs were found this way, both invisible to synthetic fixtures:
the ₹2.00/kWh rate floor rejecting a legitimately subsidised bill, and the
required-field schema leaving Gemini no way to say "not printed".

## Known risk class: anything Gemini produces varies run to run

Three separate bugs today had the same shape — identical input, different output
between runs:

- `units_consumed` came back `null` on one run and `0` on the next, flipping the
  user-facing error between "couldn't read the units" and "this isn't a bill"
- a blank grey image was hallucinated as 150 units / Rs 348 on one run and
  496 units / Rs 1,440 on the next
- `subsidy_applied` on the same receipt read 7289 once and 72.89 the next time

**Assume every Gemini-generated value varies between runs unless a test has
proven otherwise across MULTIPLE trials.** A single green run proves nothing.
The hallucination gate was verified over 3 trials per case, on the exact image
that fooled it, plus an unrelated object, plus a real bill as control — 9/9.

## If something breaks mid-demo

| symptom | do this |
|---|---|
| connection refused / DNS failure | tunnel expired — restart `cloudflared`, re-post URL |
| OCR misreads or rejects the bill | use `POST /api/manual-bill` — type the four numbers off the paper, same response shape, no Gemini call |
| rate limit / quota wall | `DEMO_MODE=true` serves the known bill from cache in ~0.2ms; verified working with a deliberately broken API key |
| bill photo is sideways | already handled automatically; costs ~4s instead of ~1.6s |
| judge photographs a wall / hand / blank page | rejected as "This doesn't look like an electricity bill" — verified 9/9 across blank and unrelated-object images |
