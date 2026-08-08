#!/usr/bin/env bash
# Usage: ./smoke.sh [BASE_URL]
# Default base URL is http://127.0.0.1:8080

BASE_URL=${1:-"http://127.0.0.1:8080"}

echo "Running smoke tests against $BASE_URL..."

# 1. /health
echo -n "Checking /health... "
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo "PASS (200)"
else
  echo "FAIL ($HEALTH_STATUS)"
  exit 1
fi

# Create a small dummy image for testing OCR endpoints
echo "dummy" > dummy_test_img.jpg

# 2. /api/extract-bill
echo -n "Checking /api/extract-bill... "
BILL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -F "image=@dummy_test_img.jpg;type=image/jpeg" "$BASE_URL/api/extract-bill")
if [ "$BILL_STATUS" -eq 200 ] || [ "$BILL_STATUS" -eq 400 ]; then
  echo "PASS ($BILL_STATUS)"
else
  echo "FAIL ($BILL_STATUS)"
  exit 1
fi

# 3. /api/extract-nameplate
echo -n "Checking /api/extract-nameplate... "
NP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -F "image=@dummy_test_img.jpg;type=image/jpeg" "$BASE_URL/api/extract-nameplate")
if [ "$NP_STATUS" -eq 200 ] || [ "$NP_STATUS" -eq 400 ]; then
  echo "PASS ($NP_STATUS)"
else
  echo "FAIL ($NP_STATUS)"
  exit 1
fi

# 4. /api/analyze
echo -n "Checking /api/analyze... "
ANALYZE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d '{"bill": {"units_consumed": 620, "total_amount": 4800, "billing_days": 61, "tariff_slab": "LT-1A"}, "appliances": [{"id": "ac-1", "type": "ac", "star": 3, "year": 2020, "hours_band": "4-6", "symptoms": []}]}' "$BASE_URL/api/analyze")
if [ "$ANALYZE_STATUS" -eq 200 ]; then
  echo "PASS (200)"
else
  echo "FAIL ($ANALYZE_STATUS)"
  exit 1
fi

rm -f dummy_test_img.jpg
echo "All smoke tests passed successfully!"
