import os
import time
from datetime import datetime, timezone
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import AnalyzeRequest, AnalyzeResponse, ApiError, BillData, NameplateData, ManualBillRequest
from gemini.extract import extract_bill as gemini_extract_bill, extract_nameplate as gemini_extract_nameplate
from gemini.validate import GeminiValidationError, validate_bill
from gemini.client import get_last_model_used

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_MODE = not os.getenv("GEMINI_API_KEY")
print(f"INFO: MOCK_MODE = {MOCK_MODE} (GEMINI_API_KEY {'is' if not MOCK_MODE else 'is not'} set)")

# Helper to load mocks
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_mock_path(filename: str) -> str:
    return os.path.join(BASE_DIR, "mocks", filename)

@app.get("/health")
def health():
    return {"ok": True, "version": "engine-1"}


@app.post("/api/extract-bill")
async def extract_bill(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(ok=False, reason="INVALID_BILL", message="Not an image file").model_dump()
        )
    
    try:
        content = await image.read()
        data = gemini_extract_bill(content, mime_type=image.content_type)
        return data
    except GeminiValidationError as gve:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(ok=False, reason=gve.reason, message=gve.message).model_dump()
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ApiError(ok=False, reason="SERVER_ERROR", message=str(e)).model_dump()
        )

@app.post("/api/extract-nameplate")
async def extract_nameplate(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(ok=False, reason="INVALID_BILL", message="Not an image file").model_dump()
        )
    
    try:
        content = await image.read()
        data = gemini_extract_nameplate(content, mime_type=image.content_type)
        return data
    except GeminiValidationError as gve:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(ok=False, reason=gve.reason, message=gve.message).model_dump()
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ApiError(ok=False, reason="SERVER_ERROR", message=str(e)).model_dump()
        )


@app.post("/api/manual-bill")
def manual_bill(payload: ManualBillRequest):
    """Manual-entry fallback — the PRD kill switch for when OCR is unusable.

    Takes the numbers straight off the paper bill, runs them through the SAME
    validation gate as extraction, and returns the SAME shape as
    /api/extract-bill. The frontend can substitute one call for the other.

    Deliberately no Gemini call: nothing here needs reading or explaining, and
    this endpoint has to work when Gemini is exactly what is broken. It stays
    functional in MOCK_MODE and with no API key at all.
    """
    try:
        validated = validate_bill(payload.model_dump())
    except GeminiValidationError as gve:
        # Same reason codes as extraction — the frontend branches on those — but
        # the copy has to suit typing, not photographing. "Try a clearer photo"
        # is nonsense advice for a number the user entered by hand.
        message = gve.message
        if "photo" in message.lower() or "picture" in message.lower():
            message = "Check the value you entered against the printed bill."
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(ok=False, reason=gve.reason, message=message).model_dump()
        )
    # period_end is optional on input but always present on output, so the
    # response shape is identical to extraction's.
    validated["period_end"] = validated.get("period_end") or ""
    return validated


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    t_start = time.perf_counter()
    
    with open(get_mock_path("analyze.json"), "r", encoding="utf-8") as f:
        data = json.load(f)
        
    if not MOCK_MODE:
        from engine.calculator import analyze as real_analyze, CalculatorError
        from engine.insights import efficiency_gap, co2, savings, biggest_surprise, solar_payback
        from engine.actions import generate_actions
        from gemini.explain import generate_explanation
        try:
            real_res = real_analyze(payload.bill, payload.appliances)
            rate = payload.bill.total_amount / payload.bill.units_consumed
            
            actions = generate_actions(payload.appliances, real_res["breakdown"], rate, payload.bill.billing_days)
            eff_gap = efficiency_gap(payload.appliances, payload.bill, payload.bill.billing_days, rate)
            
            co2_val = co2(payload.bill.units_consumed, payload.bill.billing_days)
            savings_dict = savings(actions, payload.bill.total_amount)
            annual_saved_units = savings_dict["annual_savings_rupees"] / rate
            annual_units_after = (payload.bill.units_consumed * 365.0 / payload.bill.billing_days) - annual_saved_units
            co2_val_after = round(max(0.0, annual_units_after) * 0.71)
            
            surprise = biggest_surprise(real_res["breakdown"])
            solar = solar_payback(payload.bill, payload.bill.billing_days, rate)
            
            insights = {
                "efficiency_gap_percent": eff_gap["efficiency_gap_percent"],
                "efficiency_gap_rupees": eff_gap["efficiency_gap_rupees"],
                "efficiency_driver": eff_gap["efficiency_driver"],
                "energy_score": eff_gap["energy_score"],
                "co2_kg_year": float(co2_val),
                "co2_kg_year_after": float(co2_val_after),
                "monthly_savings_rupees": savings_dict["monthly_savings_rupees"],
                "annual_savings_rupees": savings_dict["annual_savings_rupees"],
                "biggest_surprise": surprise,
                "solar": solar
            }
            
            explanation = generate_explanation(payload.bill, real_res["breakdown"], actions, language="ta")
            
            data = {
                "ok": True,
                "bill_total_rupees": real_res["bill_total_rupees"],
                "breakdown": real_res["breakdown"],
                "scale_factor": real_res["scale_factor"],
                "confidence_percent": real_res["confidence_percent"],
                "confidence_reasons": real_res["confidence_reasons"],
                "explanation": explanation,
                "actions": actions,
                "insights": insights,
                "meta": {
                    "engine_version": "engine-1",
                    "model": get_last_model_used(),
                    "generated_at": "",
                    "duration_ms": 0.0
                }
            }
        except CalculatorError as ce:
            return JSONResponse(
                status_code=ce.status_code,
                content={"ok": False, "reason": ce.reason, "message": ce.message}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"ok": False, "reason": "SERVER_ERROR", "message": str(e)}
            )
        
    duration_ms = (time.perf_counter() - t_start) * 1000.0
    generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    data["meta"]["duration_ms"] = duration_ms
    data["meta"]["generated_at"] = generated_at
    
    return data

