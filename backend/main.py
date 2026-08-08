from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/extract-bill")
def extract_bill():
    return {}

@app.post("/api/extract-nameplate")
def extract_nameplate():
    return {}

@app.post("/api/analyze")
def analyze():
    return {}
