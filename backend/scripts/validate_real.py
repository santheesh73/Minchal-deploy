"""Live extraction validation against ground truth.

Scores /api/extract-bill and /api/extract-nameplate on every image in
test-assets/, comparing bill fields against test-assets/bills/GROUND_TRUTH.md.

Exits non-zero when fewer than 70% of bills yield units_consumed AND
total_amount, so it fails loudly instead of quietly passing. It also refuses to
report success against MOCK_MODE — a mocked run is not validation.

    python scripts/validate_real.py [--base-url URL]
"""
import argparse
import json
import os
import re
import sys
import time

import httpx

DEFAULT_BASE_URL = "http://127.0.0.1:8080"
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp")
PASS_THRESHOLD = 0.70

MIME_BY_EXT = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}

# Placeholder identity printed on the synthetic fixtures. Extraction must never
# return any of these — the privacy rule is enforced in prompt and schema, this
# is the check that it actually holds end to end.
PRIVACY_MARKERS = ["test consumer", "00000000000", "test street", "chennai 600001"]


def find_assets_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    for candidate in (
        os.path.join(os.path.dirname(here), "test-assets"),
        os.path.join(os.path.dirname(os.path.dirname(here)), "test-assets"),
    ):
        if os.path.isdir(candidate):
            return candidate
    return os.path.join(os.path.dirname(os.path.dirname(here)), "test-assets")


def load_ground_truth(bills_dir: str) -> dict:
    """Reads the JSON block out of GROUND_TRUTH.md — one source of truth, kept
    human-readable so it can be checked against the paper bill."""
    path = os.path.join(bills_dir, "GROUND_TRUTH.md")
    if not os.path.isfile(path):
        print(f"  ! No GROUND_TRUTH.md in {bills_dir} - extraction cannot be scored, only smoke-tested.")
        return {}
    with open(path, encoding="utf-8") as f:
        content = f.read()
    match = re.search(r"```json\s*(\{.*?\})\s*```", content, re.DOTALL)
    if not match:
        print(f"  ! GROUND_TRUTH.md has no ```json block - extraction cannot be scored.")
        return {}
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as e:
        print(f"  ! GROUND_TRUTH.md JSON block is malformed ({e}) - extraction cannot be scored.")
        return {}


def list_images(directory: str):
    if not os.path.isdir(directory):
        return []
    return sorted(
        f for f in os.listdir(directory)
        if os.path.isfile(os.path.join(directory, f)) and f.lower().endswith(IMAGE_EXTS)
    )


def field_matches(got, want) -> bool:
    if want is None:
        return got is None  # absent on the bill: a number here is a hallucination
    if got is None:
        return False
    if isinstance(want, str):
        return str(want).lower() in str(got).lower()
    try:
        return abs(float(got) - float(want)) < 0.01
    except (TypeError, ValueError):
        return False


# MOCK_MODE canned values. No fixture may reuse these (see GROUND_TRUTH.md).
MOCK_SIGNATURE = (620.0, 4800.0)


def detect_mock_mode(readings) -> bool:
    """True when the backend is serving canned data rather than reading images.

    Inferred rather than asked: /health has a locked response shape, and adding
    a flag there would be a contract change. MOCK_MODE returns one fixed payload
    for every image, so identical readings across different bills — or anything
    matching the canned signature — means nothing was actually extracted.
    """
    if any(r == MOCK_SIGNATURE for r in readings):
        return True
    return len(readings) > 1 and len(set(readings)) == 1


def validate_bills(client, base_url, bills_dir, truth):
    files = list_images(bills_dir)
    print(f"\nBILLS  ({bills_dir})")
    print(f"Found {len(files)} image(s): {', '.join(files) if files else 'NONE'}\n")

    hdr = f"{'File':<26} | {'Status':<7} | {'Units':>8} | {'Total':>9} | {'Days':>5} | {'Slab':<8} | {'ms':>6} | {'Score':<7} | Notes"
    print(hdr)
    print("-" * len(hdr))

    extracted_ok = 0
    expected_extractable = 0
    field_hits = field_total = 0
    privacy_leaks = []
    hallucinations = []
    rows_scored = 0
    readings = []

    for name in files:
        path = os.path.join(bills_dir, name)
        ext = os.path.splitext(name)[1].lower()
        mime = MIME_BY_EXT.get(ext, "image/jpeg")
        expected = truth.get(name)
        # An image whose ground truth says a gate-required field is absent can
        # never pass validation — rejecting it is the correct outcome, so it must
        # not count against the extraction rate. billing_days matters as much as
        # units here: a payment receipt prints units but no billing period, and
        # the gate rejects the whole bill for the missing period even though
        # extraction did its job.
        known_absent = expected is not None and any(
            expected.get(f) is None for f in ("units_consumed", "billing_days")
        )
        if not known_absent:
            expected_extractable += 1

        t0 = time.perf_counter()
        try:
            with open(path, "rb") as fh:
                res = client.post(f"{base_url}/api/extract-bill", files={"image": (name, fh, mime)}, timeout=120)
            ms = (time.perf_counter() - t0) * 1000
        except Exception as e:
            print(f"{name:<26} | {'ERROR':<7} | {'-':>8} | {'-':>9} | {'-':>5} | {'-':<8} | {'-':>6} | {'-':<7} | {e}")
            continue

        if res.status_code != 200:
            body = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            reason = body.get("reason", f"HTTP {res.status_code}")
            note = f"{reason}: {body.get('message', '')}"
            # A rejection is CORRECT when ground truth says units are absent.
            score = ""
            if known_absent:
                score = "n/a"
                missing_gt = [f for f in ("units_consumed", "billing_days") if expected.get(f) is None]
                note += f"  <- correct: {', '.join(missing_gt)} not printed on this image"
            print(f"{name:<26} | {'REJECT':<7} | {'-':>8} | {'-':>9} | {'-':>5} | {'-':<8} | {ms:6.0f} | {score:<7} | {note}")
            continue

        data = res.json()
        units, total = data.get("units_consumed"), data.get("total_amount")
        days, slab = data.get("billing_days"), data.get("tariff_slab")
        if units is not None and total is not None:
            readings.append((float(units), float(total)))
            # Hallucination is per-field: only if ground truth says THESE
            # numbers are not on the image. real_bill_01 is excluded from the
            # rate (no billing period) yet genuinely prints units 239 - reading
            # it is correct, not invention.
            if expected is not None and expected.get("units_consumed") is None:
                hallucinations.append((name, units, total))
            elif not known_absent:
                extracted_ok += 1

        blob = json.dumps(data).lower()
        leaked = [m for m in PRIVACY_MARKERS if m in blob]
        if leaked:
            privacy_leaks.append((name, leaked))

        score, notes = "-", ""
        if expected:
            rows_scored += 1
            hits, misses = 0, []
            for field, want in expected.items():
                field_total += 1
                if field_matches(data.get(field), want):
                    hits += 1
                    field_hits += 1
                else:
                    misses.append(f"{field}={data.get(field)!r}!={want!r}")
            score = f"{hits}/{len(expected)}"
            notes = "; ".join(misses)
        else:
            notes = "no ground truth"
        if leaked:
            notes = f"PRIVACY LEAK {leaked}  {notes}"

        print(f"{name:<26} | {'OK':<7} | {str(units):>8} | {str(total):>9} | {str(days):>5} | {str(slab):<8} | {ms:6.0f} | {score:<7} | {notes}")

    return dict(files=len(files), extracted_ok=extracted_ok,
                expected_extractable=expected_extractable, field_hits=field_hits,
                field_total=field_total, privacy_leaks=privacy_leaks,
                hallucinations=hallucinations, rows_scored=rows_scored,
                readings=readings)


def validate_nameplates(client, base_url, dir_):
    files = list_images(dir_)
    print(f"\nNAMEPLATES  ({dir_})")
    print(f"Found {len(files)} image(s): {', '.join(files) if files else 'NONE'}\n")
    if not files:
        return dict(files=0, ok=0)

    hdr = f"{'File':<26} | {'Status':<7} | {'Type':<14} | {'Watts':>7} | {'Star':>5} | {'ms':>6} | Notes"
    print(hdr)
    print("-" * len(hdr))

    ok = 0
    for name in files:
        ext = os.path.splitext(name)[1].lower()
        mime = MIME_BY_EXT.get(ext, "image/jpeg")
        t0 = time.perf_counter()
        try:
            with open(os.path.join(dir_, name), "rb") as fh:
                res = client.post(f"{base_url}/api/extract-nameplate", files={"image": (name, fh, mime)}, timeout=120)
            ms = (time.perf_counter() - t0) * 1000
        except Exception as e:
            print(f"{name:<26} | {'ERROR':<7} | {'-':<14} | {'-':>7} | {'-':>5} | {'-':>6} | {e}")
            continue
        if res.status_code == 200:
            d = res.json()
            ok += 1
            print(f"{name:<26} | {'OK':<7} | {str(d.get('appliance_type')):<14} | {str(d.get('rated_power_w')):>7} | {str(d.get('star_rating')):>5} | {ms:6.0f} | ")
        else:
            b = res.json()
            print(f"{name:<26} | {'FAIL':<7} | {'-':<14} | {'-':>7} | {'-':>5} | {ms:6.0f} | {b.get('reason')}: {b.get('message', '')}")
    return dict(files=len(files), ok=ok)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=os.getenv("MINCHAL_BASE_URL", DEFAULT_BASE_URL))
    args = ap.parse_args()
    base_url = args.base_url.rstrip("/")

    assets = find_assets_dir()
    bills_dir = os.path.join(assets, "bills")
    truth = load_ground_truth(bills_dir)

    print("=" * 118)
    print(f"  LIVE EXTRACTION VALIDATION  ->  {base_url}")
    print("=" * 118)

    client = httpx.Client()
    try:
        client.get(f"{base_url}/health", timeout=10).raise_for_status()
    except Exception as e:
        print(f"\nFAIL: backend not reachable at {base_url}/health ({e})")
        return 2

    bills = validate_bills(client, base_url, bills_dir, truth)
    mock = detect_mock_mode(bills["readings"])
    plates = validate_nameplates(client, base_url, os.path.join(assets, "nameplates"))

    n = bills["expected_extractable"]
    skipped = bills["files"] - n
    rate = bills["extracted_ok"] / n if n else 0.0
    accuracy = bills["field_hits"] / bills["field_total"] if bills["field_total"] else None

    print("\n" + "=" * 118)
    print("SUMMARY")
    print("-" * 118)
    note = (f"   ({skipped} image(s) excluded: a gate-required field is not printed on them, "
            f"so rejection is correct)") if skipped else ""
    print(f"  Bills with units_consumed AND total_amount : {bills['extracted_ok']}/{n}  ({rate*100:.0f}%)   threshold {PASS_THRESHOLD*100:.0f}%{note}")
    if accuracy is not None:
        print(f"  Field accuracy vs ground truth            : {bills['field_hits']}/{bills['field_total']}  ({accuracy*100:.0f}%)   over {bills['rows_scored']} scored image(s)")
    else:
        print("  Field accuracy vs ground truth            : NOT SCORED (no ground truth matched)")
    print(f"  Nameplates extracted                      : {plates['ok']}/{plates['files']}")
    print(f"  Privacy leaks                             : {len(bills['privacy_leaks'])}")
    print(f"  Hallucinated fields (absent on image)     : {len(bills['hallucinations'])}")

    failures = []
    if n == 0:
        failures.append("no extractable bill images found - nothing was validated")
    if mock:
        failures.append("backend is in MOCK_MODE - mocked responses cannot validate extraction")
    if n and rate < PASS_THRESHOLD:
        failures.append(f"extraction rate {rate*100:.0f}% is below the {PASS_THRESHOLD*100:.0f}% threshold")
    for name, leaked in bills["privacy_leaks"]:
        failures.append(f"privacy leak in {name}: {leaked}")
    for name, u, t in bills["hallucinations"]:
        failures.append(f"hallucination in {name}: returned units={u} total={t} but the image prints neither")

    real = [f for f in list_images(bills_dir) if not f.startswith("synthetic_")]
    print("-" * 118)
    if failures:
        for f in failures:
            print(f"  FAIL: {f}")
        print("=" * 118)
        return 1

    print("  PASS")
    if not real:
        print("\n  ! Only synthetic fixtures were scored. Generated noise is not real noise -")
        print("    photograph one actual TNEB bill into test-assets/bills/ before trusting this")
        print("    for the demo, and add its values to GROUND_TRUTH.md.")
    print("=" * 118)
    return 0


if __name__ == "__main__":
    sys.exit(main())
