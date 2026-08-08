"""Pre-demo integration readiness check.

Run this before the demo. It hits the URL the frontend actually uses — the
tunnel, not localhost — and asserts every property the UI depends on, including
the arithmetic invariants that prove the deterministic engine, not Gemini, is
producing the rupee figures.

    python scripts/preflight.py                      # tunnel (default)
    python scripts/preflight.py --base-url http://127.0.0.1:8080
    python scripts/preflight.py --json               # machine-readable

Exits 0 only if every check passes.
"""
import argparse
import json
import os
import sys
import time

import httpx

# The explanation is Tamil, and the Windows console is cp1252 — printing it raw
# raises UnicodeEncodeError and takes down the whole check. Degrade the glyphs,
# never the run.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

# What the frontend is pointed at. Overridable, but the default is deliberately
# the tunnel: checking localhost proves nothing about what FE hits.
DEFAULT_BASE_URL = os.getenv(
    "MINCHAL_BASE_URL", "https://yearly-handy-till-aspects.trycloudflare.com"
)

UNITS_TOLERANCE = 0.1
RUPEES_TOLERANCE = 1.0


class Check:
    def __init__(self, name):
        self.name = name
        self.ok = None
        self.detail = ""

    def passed(self, detail=""):
        self.ok, self.detail = True, detail
        return self

    def failed(self, detail):
        self.ok, self.detail = False, detail
        return self


def load_request(base_dir, name="analyze_request.json"):
    path = os.path.join(base_dir, "mocks", name)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def check_tunnel(client, base_url):
    """FIRST assertion, and fail-fast: everything else depends on it, and a dead
    tunnel otherwise produces a wall of failures that all trace to one cause."""
    c = Check("tunnel reachable")
    try:
        res = client.get(f"{base_url}/health", timeout=20)
    except Exception as e:
        return c.failed(f"{type(e).__name__}: {e}  ->  RESTART CLOUDFLARED: .\\cloudflared.exe tunnel --url http://localhost:8080")
    if res.status_code != 200:
        return c.failed(f"HTTP {res.status_code} from /health -> is uvicorn up on 8080?")
    return c.passed(f"HTTP 200 from {base_url}")


def check_health(res_json):
    c = Check("/health responds")
    if not isinstance(res_json, dict) or res_json.get("ok") is not True:
        return c.failed(f"unexpected body: {res_json!r}")
    return c.passed(f"version={res_json.get('version')}")


def run_checks(base_url, base_dir):
    client = httpx.Client()
    checks = []

    tunnel = check_tunnel(client, base_url)
    checks.append(tunnel)
    if not tunnel.ok:
        return checks, None  # fail fast: nothing below can succeed

    health = client.get(f"{base_url}/health", timeout=20).json()
    checks.append(check_health(health))

    payload = load_request(base_dir)

    # two calls: duration_ms must be real per-request timing, not a constant
    t0 = time.perf_counter()
    r1 = client.post(f"{base_url}/api/analyze", json=payload, timeout=180)
    wall1 = (time.perf_counter() - t0) * 1000
    r2 = client.post(f"{base_url}/api/analyze", json=payload, timeout=180)

    c = Check("/api/analyze returns 200")
    if r1.status_code != 200:
        checks.append(c.failed(f"HTTP {r1.status_code}: {r1.text[:200]}"))
        return checks, None
    checks.append(c.passed(f"wall {wall1:.0f}ms"))

    d1, d2 = r1.json(), r2.json()

    # --- full valid response ------------------------------------------------
    c = Check("response validates against AnalyzeResponse")
    try:
        sys.path.insert(0, base_dir)
        from schemas import AnalyzeResponse
        AnalyzeResponse(**d1)
        checks.append(c.passed("all required fields present and typed"))
    except Exception as e:
        checks.append(c.failed(str(e)[:300]))

    breakdown = d1.get("breakdown") or []
    bill_units = payload["bill"]["units_consumed"]
    bill_total = payload["bill"]["total_amount"]

    # --- arithmetic invariants ----------------------------------------------
    # These are the headline technical claim: a deterministic engine produces
    # every rupee figure. If these drift, something is inventing numbers.
    c = Check(f"breakdown units sum to units_consumed (+-{UNITS_TOLERANCE})")
    got = sum(float(i.get("units", 0)) for i in breakdown)
    if abs(got - bill_units) <= UNITS_TOLERANCE:
        checks.append(c.passed(f"{got:.2f} vs {bill_units}"))
    else:
        checks.append(c.failed(f"{got:.2f} vs {bill_units} (drift {got - bill_units:+.2f})"))

    c = Check(f"breakdown rupees sum to total_amount (+-{RUPEES_TOLERANCE})")
    got = sum(float(i.get("rupees", 0)) for i in breakdown)
    if abs(got - bill_total) <= RUPEES_TOLERANCE:
        checks.append(c.passed(f"{got:.2f} vs {bill_total}"))
    else:
        checks.append(c.failed(f"{got:.2f} vs {bill_total} (drift {got - bill_total:+.2f})"))

    # --- working[] on every real appliance -----------------------------------
    c = Check("every non-'other' item has non-empty working[]")
    missing = [
        i.get("label", i.get("type"))
        for i in breakdown
        if i.get("type") != "other" and not (i.get("working") or [])
    ]
    if breakdown and not missing:
        checks.append(c.passed(f"{len([i for i in breakdown if i.get('type') != 'other'])} item(s) show their working"))
    else:
        checks.append(c.failed(f"missing working[] on: {missing}" if missing else "breakdown is empty"))

    # --- confidence ----------------------------------------------------------
    c = Check("confidence_reasons has exactly 3 entries")
    reasons = d1.get("confidence_reasons") or []
    if len(reasons) == 3:
        checks.append(c.passed("3"))
    else:
        checks.append(c.failed(f"got {len(reasons)}"))

    # --- insights ------------------------------------------------------------
    c = Check("insights.efficiency_gap_percent present and >= 0")
    gap = (d1.get("insights") or {}).get("efficiency_gap_percent")
    if gap is None:
        checks.append(c.failed("missing"))
    elif float(gap) < 0:
        checks.append(c.failed(f"negative: {gap}"))
    else:
        checks.append(c.passed(f"{gap}"))

    # --- meta ----------------------------------------------------------------
    c = Check("meta.duration_ms > 0 and differs between calls")
    m1 = (d1.get("meta") or {}).get("duration_ms")
    m2 = (d2.get("meta") or {}).get("duration_ms")
    if not m1 or float(m1) <= 0:
        checks.append(c.failed(f"duration_ms={m1!r}"))
    elif m1 == m2:
        checks.append(c.failed(f"identical across calls ({m1}) - timing is hardcoded, not measured"))
    else:
        checks.append(c.passed(f"{float(m1):.1f}ms then {float(m2):.1f}ms"))

    # --- explanation ---------------------------------------------------------
    c = Check("explanation is non-empty")
    expl = (d1.get("explanation") or "").strip()
    if not expl:
        checks.append(c.failed("empty"))
    else:
        # Report the script rather than the text: the console may not render
        # Tamil, and "is it actually Tamil" is the thing worth knowing anyway.
        tamil = sum(1 for ch in expl if "஀" <= ch <= "௿")
        script = f"{100 * tamil // len(expl)}% Tamil" if tamil else "NO Tamil chars"
        checks.append(c.passed(f"{len(expl)} chars, {script}"))

    # --- the shape the real UI actually sends --------------------------------
    # The stock request has a symptom on every appliance. The real frontend
    # sends symptoms: [] when the user ticks nothing, which is the common case,
    # and that difference 500ed the whole analysis while every other check here
    # stayed green. Never let this hole reopen: a preflight that only exercises
    # the convenient payload is measuring the wrong thing.
    c = Check("/api/analyze accepts a request with NO symptoms")
    try:
        no_sym = load_request(base_dir, "analyze_request_no_symptoms.json")
        r3 = client.post(f"{base_url}/api/analyze", json=no_sym, timeout=180)
        if r3.status_code != 200:
            checks.append(c.failed(f"HTTP {r3.status_code}: {r3.text[:160]}"))
        else:
            d3 = r3.json()
            rup = sum(float(i.get("rupees", 0)) for i in (d3.get("breakdown") or []))
            want = no_sym["bill"]["total_amount"]
            if abs(rup - want) > RUPEES_TOLERANCE:
                checks.append(c.failed(f"rupees {rup:.2f} vs {want}"))
            else:
                empty = sum(1 for a in no_sym["appliances"] if not a.get("symptoms"))
                checks.append(c.passed(f"{empty} appliance(s) with no symptoms, rupees still sum to {rup:.2f}"))
    except FileNotFoundError:
        checks.append(c.failed("mocks/analyze_request_no_symptoms.json is missing"))
    except Exception as e:
        checks.append(c.failed(str(e)[:160]))

    # --- kill switch ---------------------------------------------------------
    c = Check("/api/manual-bill kill switch responds")
    try:
        mb = client.post(f"{base_url}/api/manual-bill", json={
            "units_consumed": 620, "total_amount": 4800,
            "billing_days": 61, "tariff_slab": "LT-1A",
        }, timeout=60)
        if mb.status_code == 200 and mb.json().get("units_consumed") == 620.0:
            checks.append(c.passed("available as OCR fallback"))
        else:
            checks.append(c.failed(f"HTTP {mb.status_code}: {mb.text[:150]}"))
    except Exception as e:
        checks.append(c.failed(str(e)[:150]))

    return checks, d1


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL,
                    help=f"default: {DEFAULT_BASE_URL}")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()
    base_url = args.base_url.rstrip("/")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    checks, data = run_checks(base_url, base_dir)

    if args.json:
        print(json.dumps({
            "base_url": base_url,
            "pass": all(c.ok for c in checks),
            "checks": [{"name": c.name, "ok": c.ok, "detail": c.detail} for c in checks],
        }, indent=2))
        return 0 if all(c.ok for c in checks) else 1

    width = 62
    print()
    print("=" * (width + 30))
    print(f"  MINCHAL PREFLIGHT  ->  {base_url}")
    print("=" * (width + 30))
    for c in checks:
        mark = "PASS" if c.ok else "FAIL"
        print(f"  [{mark}]  {c.name:<{width}}  {c.detail}")
    print("=" * (width + 30))

    failed = [c for c in checks if not c.ok]
    if failed:
        print(f"  {len(failed)} of {len(checks)} CHECKS FAILED - DO NOT DEMO UNTIL RESOLVED")
        for c in failed:
            print(f"     - {c.name}: {c.detail}")
        print("=" * (width + 30))
        return 1

    print(f"  ALL {len(checks)} CHECKS PASSED - READY TO DEMO")
    print("=" * (width + 30))
    return 0


if __name__ == "__main__":
    sys.exit(main())
