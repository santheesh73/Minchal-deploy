import os
import time
from datetime import datetime, timezone
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import AnalyzeRequest, AnalyzeResponse, ApiError, BillData, NameplateData
from gemini.extract import extract_bill as gemini_extract_bill, extract_nameplate as gemini_extract_nameplate
from gemini.validate import GeminiValidationError

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


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    t_start = time.perf_counter()
    
    with open(get_mock_path("analyze.json"), "r", encoding="utf-8") as f:
        data = json.load(f)
        
    if not MOCK_MODE:
        from engine.calculator import analyze as real_analyze, CalculatorError
        try:
            real_res = real_analyze(payload.bill, payload.appliances)
            data["bill_total_rupees"] = real_res["bill_total_rupees"]
            data["breakdown"] = real_res["breakdown"]
            data["scale_factor"] = real_res["scale_factor"]
            data["confidence_percent"] = real_res["confidence_percent"]
            data["confidence_reasons"] = real_res["confidence_reasons"]
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

