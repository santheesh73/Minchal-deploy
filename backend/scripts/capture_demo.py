"""Captures a real /api/analyze run for DEMO_MODE's cache.

This is step 1 of the SWAP PROCEDURE in demo_cache.py. It extracts a real bill,
runs analyze against it for real, verifies the arithmetic invariants, and prints
two JSON blocks to paste straight into demo_cache.py.

    python scripts/capture_demo.py --image ../test-assets/bills/<real>.png
    python scripts/capture_demo.py --units 735 --total 5420 --days 61 --slab LT-1A

DEMO_MODE must be OFF on the server while capturing, or you will capture the
cache instead of a real run. The script checks for that and refuses.
"""
import argparse
import json
import os
import sys

import httpx

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

DEFAULT_BASE_URL = os.getenv("MINCHAL_BASE_URL", "http://127.0.0.1:8080")
MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}


def die(msg, code=1):
    print(f"\nFAIL: {msg}")
    sys.exit(code)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--image", help="real bill photo to extract from")
    ap.add_argument("--units", type=float)
    ap.add_argument("--total", type=float)
    ap.add_argument("--days", type=int)
    ap.add_argument("--slab", default="LT-1A")
    args = ap.parse_args()

    base_url = args.base_url.rstrip("/")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    client = httpx.Client()

    try:
        client.get(f"{base_url}/health", timeout=20).raise_for_status()
    except Exception as e:
        die(f"backend not reachable at {base_url} ({e})")

    # 1. get the bill, by extraction or by hand
    if args.image:
        path = args.image if os.path.isabs(args.image) else os.path.join(os.getcwd(), args.image)
        if not os.path.isfile(path):
            die(f"no such image: {path}")
        ext = os.path.splitext(path)[1].lower()
        with open(path, "rb") as fh:
            res = client.post(f"{base_url}/api/extract-bill",
                              files={"image": (os.path.basename(path), fh, MIME.get(ext, "image/jpeg"))},
                              timeout=180)
        if res.status_code != 200:
            die(f"extraction failed on {os.path.basename(path)}: {res.text[:300]}")
        bill = res.json()
        print(f"  extracted from {os.path.basename(path)}: "
              f"{bill.get('units_consumed')} units / Rs {bill.get('total_amount')}")
    elif args.units and args.total and args.days:
        res = client.post(f"{base_url}/api/manual-bill", json={
            "units_consumed": args.units, "total_amount": args.total,
            "billing_days": args.days, "tariff_slab": args.slab,
        }, timeout=60)
        if res.status_code != 200:
            die(f"manual-bill rejected those values: {res.text[:300]}")
        bill = res.json()
    else:
        die("give either --image, or all of --units --total --days")

    # 2. run analyze for real
    with open(os.path.join(base_dir, "mocks", "analyze_request.json"), encoding="utf-8") as f:
        payload = json.load(f)
    payload["bill"] = bill

    res = client.post(f"{base_url}/api/analyze", json=payload, timeout=240)
    if res.status_code != 200:
        die(f"analyze failed: {res.text[:300]}")
    data = res.json()

    # 3. refuse to capture the cache — that would freeze a copy of a copy
    if data.get("meta", {}).get("data_source"):
        die("the server served a CACHED response (meta.data_source present). "
            "Turn DEMO_MODE off and re-run, or you will cache the cache.")

    # 4. verify invariants before enshrining these numbers as the safety net
    units_sum = sum(float(i["units"]) for i in data["breakdown"])
    rupees_sum = sum(float(i["rupees"]) for i in data["breakdown"])
    if abs(units_sum - float(bill["units_consumed"])) > 0.1:
        die(f"units do not sum: {units_sum} vs {bill['units_consumed']}")
    if abs(rupees_sum - float(bill["total_amount"])) > 1.0:
        die(f"rupees do not sum: {rupees_sum} vs {bill['total_amount']}")
    if not (data.get("explanation") or "").strip():
        die("explanation is empty - do not cache this")

    print(f"  analyze OK: model={data['meta'].get('model')} "
          f"duration={data['meta'].get('duration_ms', 0):.0f}ms  invariants hold")

    # meta timing is re-measured per request, so it must not be frozen
    data["meta"] = {k: v for k, v in data["meta"].items() if k in ("engine_version", "model")}

    print("\n" + "=" * 78)
    print("PASTE INTO demo_cache.py -> DEMO_BILL_JSON")
    print("=" * 78)
    print(json.dumps(bill, ensure_ascii=False, indent=2))
    print("\n" + "=" * 78)
    print("PASTE INTO demo_cache.py -> DEMO_RESPONSE_JSON")
    print("=" * 78)
    print(json.dumps(data, ensure_ascii=False, indent=2))
    print("=" * 78)
    print("Then: set PLACEHOLDER_DATA = False, delete the DELETE-ON-SWAP line,")
    print("      and run  python scripts/preflight.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
