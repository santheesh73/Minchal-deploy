import os
import time
import httpx

BASE_URL = "http://127.0.0.1:8080"
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test-assets")
if not os.path.exists(ASSETS_DIR):
    # Try repository level test-assets
    ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "test-assets")

def test_endpoints():
    client = httpx.Client()
    
    bills_dir = os.path.join(ASSETS_DIR, "bills")
    nameplates_dir = os.path.join(ASSETS_DIR, "nameplates")
    
    print("\n" + "=" * 80)
    print("                      LIVE EXTRACTION VALIDATION REPORT")
    print("=" * 80)
    
    # 1. Test Bills
    bill_files = []
    if os.path.exists(bills_dir):
        bill_files = [f for f in os.listdir(bills_dir) if f != ".gitkeep" and os.path.isfile(os.path.join(bills_dir, f))]
        
    print(f"\nScanning Bills Directory: {bills_dir}")
    print(f"Found {len(bill_files)} bill image(s) to process.\n")
    
    print(f"{'Filename':<30} | {'Status':<6} | {'Units':<8} | {'Total':<8} | {'Days':<6} | {'Latency':<8} | {'Error'}")
    print("-" * 100)
    
    bill_ok_count = 0
    for idx, f in enumerate(bill_files):
        fpath = os.path.join(bills_dir, f)
        mime = "image/jpeg"
        if f.lower().endswith(".png"):
            mime = "image/png"
        elif f.lower().endswith(".webp"):
            mime = "image/webp"
            
        t_start = time.perf_counter()
        try:
            with open(fpath, "rb") as img:
                res = client.post(
                    f"{BASE_URL}/api/extract-bill",
                    files={"image": (f, img, mime)}
                )
            latency = (time.perf_counter() - t_start) * 1000.0
            
            if res.status_code == 200:
                data = res.json()
                units = data.get("units_consumed", "None")
                total = data.get("total_amount", "None")
                days = data.get("billing_days", "None")
                print(f"{f:<30} | OK     | {str(units):<8} | {str(total):<8} | {str(days):<6} | {latency:6.1f}ms | -")
                bill_ok_count += 1
            else:
                data = res.json()
                reason = data.get("reason", "Unknown")
                msg = data.get("message", "")
                print(f"{f:<30} | FAIL   | {'-':<8} | {'-':<8} | {'-':<6} | {latency:6.1f}ms | {reason}: {msg}")
        except Exception as e:
            latency = (time.perf_counter() - t_start) * 1000.0
            print(f"{f:<30} | ERROR  | {'-':<8} | {'-':<8} | {'-':<6} | {latency:6.1f}ms | {str(e)}")
            
    # 2. Test Nameplates
    nameplate_files = []
    if os.path.exists(nameplates_dir):
        nameplate_files = [f for f in os.listdir(nameplates_dir) if f != ".gitkeep" and os.path.isfile(os.path.join(nameplates_dir, f))]
        
    print(f"\nScanning Nameplates Directory: {nameplates_dir}")
    print(f"Found {len(nameplate_files)} nameplate image(s) to process.\n")
    
    print(f"{'Filename':<30} | {'Status':<6} | {'Type':<12} | {'Watts':<6} | {'Star':<5} | {'Latency':<8} | {'Error'}")
    print("-" * 100)
    
    nameplate_ok_count = 0
    for idx, f in enumerate(nameplate_files):
        fpath = os.path.join(nameplates_dir, f)
        mime = "image/jpeg"
        if f.lower().endswith(".png"):
            mime = "image/png"
        elif f.lower().endswith(".webp"):
            mime = "image/webp"
            
        t_start = time.perf_counter()
        try:
            with open(fpath, "rb") as img:
                res = client.post(
                    f"{BASE_URL}/api/extract-nameplate",
                    files={"image": (f, img, mime)}
                )
            latency = (time.perf_counter() - t_start) * 1000.0
            
            if res.status_code == 200:
                data = res.json()
                app_type = data.get("appliance_type", "None")
                watts = data.get("rated_power_w", "None")
                star = data.get("star_rating", "None")
                print(f"{f:<30} | OK     | {str(app_type):<12} | {str(watts):<6} | {str(star):<5} | {latency:6.1f}ms | -")
                nameplate_ok_count += 1
            else:
                data = res.json()
                reason = data.get("reason", "Unknown")
                msg = data.get("message", "")
                print(f"{f:<30} | FAIL   | {'-':<12} | {'-':<6} | {'-':<5} | {latency:6.1f}ms | {reason}: {msg}")
        except Exception as e:
            latency = (time.perf_counter() - t_start) * 1000.0
            print(f"{f:<30} | ERROR  | {'-':<12} | {'-':<6} | {'-':<5} | {latency:6.1f}ms | {str(e)}")
            
    print("\n" + "=" * 80)
    bill_total_count = len(bill_files)
    nameplate_total_count = len(nameplate_files)
    print(f"Summary: Bills Fully Extracted: {bill_ok_count}/{bill_total_count}")
    print(f"         Nameplates Fully Extracted: {nameplate_ok_count}/{nameplate_total_count}")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    test_endpoints()
