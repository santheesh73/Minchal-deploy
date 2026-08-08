"""Regenerates the synthetic TNEB-style bill fixtures in test-assets/bills/.

The fixtures are committed, so you do NOT need to run this — it exists so the
ground truth in test-assets/bills/GROUND_TRUTH.md is reproducible rather than
asserted. Values here are the single source of the numbers in that file; change
one, regenerate, and update the other.

Requires pillow, which is deliberately NOT in requirements.txt (dev-only):
    .venv/Scripts/python.exe -m pip install pillow
    .venv/Scripts/python.exe scripts/make_synthetic_bills.py ../test-assets/bills

These are NOT a substitute for a real photographed bill — generated noise is not
real noise. They are the floor that guarantees the accuracy gate always has
something to measure.
"""
from PIL import Image, ImageDraw, ImageFont
import os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "."

def font(sz, bold=False):
    name = "arialbd.ttf" if bold else "arial.ttf"
    try:
        return ImageFont.truetype(f"C:/Windows/Fonts/{name}", sz)
    except Exception:
        return ImageFont.load_default()

CASES = [
    # NOTE: deliberately not 620 units / Rs 4800 — those are the MOCK_MODE canned
    # values, and a fixture that matches them would let a mocked run score as a
    # partial pass. Every fixture must be distinguishable from the mocks.
    dict(name="synthetic_clean", units=735, total=5420.0, days=61, period="30/06/2026",
         slab="LT-1A", energy=4870.0, fixed=150.0, tax=400.0, blur=0, rot=0),
    dict(name="synthetic_blurred", units=284, total=1235.5, days=30, period="15/05/2026",
         slab="LT-1B", energy=1050.0, fixed=95.5, tax=90.0, blur=1, rot=1.5),
    dict(name="synthetic_highusage", units=1450, total=12180.0, days=62, period="12/07/2026",
         slab="LT-1C", energy=11200.0, fixed=280.0, tax=700.0, blur=0, rot=-0.8),
]

for c in CASES:
    W, H = 900, 1150
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    d.text((W//2, 40), "தமிழ்நாடு மின் பகிர்மான கழகம் லிமிடெட்", font=font(26, True), fill="#b0006a", anchor="mm")
    d.text((W//2, 78), "TAMIL NADU POWER DISTRIBUTION CORPORATION LTD", font=font(16), fill="#b0006a", anchor="mm")
    d.text((W//2, 112), "ELECTRICITY CONSUMPTION BILL", font=font(20, True), fill="black", anchor="mm")

    # Identifiers are deliberately fake placeholders, never copied from a real
    # bill: these fixtures are committed, and the privacy rule that forbids
    # extracting consumer identity also forbids us shipping someone's.
    d.rectangle([50, 150, W-50, 300], outline="black", width=2)
    rows_top = [
        ("Consumer Name", "TEST CONSUMER"),
        ("Consumer Number", "00000000000"),
        ("Service Address", "1 TEST STREET, CHENNAI 600001"),
        ("Tariff / Slab", c["slab"]),
    ]
    y = 168
    for k, v in rows_top:
        d.text((70, y), f"{k}", font=font(15), fill="#333")
        d.text((330, y), f": {v}", font=font(15, True), fill="black")
        y += 32

    d.rectangle([50, 330, W-50, 560], outline="black", width=2)
    d.text((70, 345), "BILLING DETAILS", font=font(16, True), fill="black")
    rows = [
        ("Billing Period From", "01/05/2026"),
        ("Billing Period To (period_end)", c["period"]),
        ("No. of Days", str(c["days"])),
        ("Previous Reading", "48210"),
        ("Present Reading", str(48210 + c["units"])),
        ("UNITS CONSUMED", f'{c["units"]}'),
    ]
    y = 378
    for k, v in rows:
        bold = "UNITS" in k
        d.text((70, y), k, font=font(15, True if bold else False), fill="black")
        d.text((520, y), f": {v}", font=font(17 if bold else 15, True), fill="black")
        y += 30

    d.rectangle([50, 590, W-50, 830], outline="black", width=2)
    d.text((70, 605), "CHARGES (Rs.)", font=font(16, True), fill="black")
    charges = [
        ("Energy Charges", c["energy"]),
        ("Fixed Charges", c["fixed"]),
        ("Taxes and Duties", c["tax"]),
        ("Subsidy Applied", -0.0),
    ]
    y = 640
    for k, v in charges:
        d.text((70, y), k, font=font(15), fill="black")
        d.text((640, y), f"{v:,.2f}", font=font(15), fill="black", anchor="ra")
        y += 32
    d.line([70, y+4, W-70, y+4], fill="black", width=2)
    d.text((70, y+16), "NET AMOUNT PAYABLE", font=font(18, True), fill="black")
    d.text((640, y+16), f'{c["total"]:,.2f}', font=font(18, True), fill="black", anchor="ra")

    d.text((70, 880), "Due Date : 25/07/2026", font=font(15), fill="black")
    d.text((70, 915), "This is a computer generated bill.", font=font(13), fill="#555")

    if c["blur"]:
        from PIL import ImageFilter, ImageEnhance
        img = img.filter(ImageFilter.GaussianBlur(0.8))
        img = ImageEnhance.Brightness(img).enhance(0.88)
    if c["rot"]:
        img = img.rotate(c["rot"], expand=True, fillcolor="white")

    path = os.path.join(OUT, c["name"] + ".png")
    img.save(path)
    print(path, "| units=", c["units"], "total=", c["total"], "days=", c["days"], "slab=", c["slab"], "period_end=", c["period"])
