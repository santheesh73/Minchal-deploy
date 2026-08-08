from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union

ApplianceType = Literal[
    "ac", "fridge", "geyser", "washing_machine", "fan", "tv", "lights", "motor_pump"
]
HoursBand = Literal["0-1", "1-2", "2-4", "4-6", "6-8", "8+"]
ErrorCode = Literal["OCR_BLUR", "OCR_MISSING_FIELD", "INVALID_BILL", "APPLIANCE_UNKNOWN", "SERVER_ERROR"]

class BillData(BaseModel):
    units_consumed: float
    total_amount: float
    billing_days: int
    period_end: str
    tariff_slab: str
    energy_charges: Optional[float] = None
    fixed_charges: Optional[float] = None
    taxes_and_duties: Optional[float] = None
    subsidy_applied: Optional[float] = None

class ManualBillRequest(BaseModel):
    """Manual-entry kill switch (POST /api/manual-bill).

    Additive only — no existing model above is touched. Lets the user type the
    four numbers off the paper bill when OCR is unusable, and returns the exact
    same shape as /api/extract-bill so the frontend can swap one call for the
    other with no other changes.
    """
    units_consumed: float
    total_amount: float
    billing_days: int
    tariff_slab: str
    # Optional so the user types four fields, not nine. Present in the response
    # regardless, so the shape matches extraction.
    period_end: Optional[str] = None
    energy_charges: Optional[float] = None
    fixed_charges: Optional[float] = None
    taxes_and_duties: Optional[float] = None
    subsidy_applied: Optional[float] = None

class NameplateData(BaseModel):
    appliance_type: ApplianceType
    rated_power_w: Optional[float] = None
    star_rating: Optional[float] = None
    capacity: Optional[float] = None
    manufacture_year: Optional[int] = None

class ApplianceInput(BaseModel):
    id: str
    type: ApplianceType
    capacity: Optional[float] = None
    star: int
    year: int
    hours_band: Optional[HoursBand] = None
    symptoms: List[str] = Field(default_factory=list)
    # Additive, optional, no existing field touched.
    #
    # hours_band alone cannot answer "did the user tell us this, or did we
    # assume it?" — the frontend pre-fills a sensible per-appliance default the
    # moment an appliance is added, so a value is always present and confidence
    # read 100% even when nothing was confirmed. This says who supplied it.
    #
    # None means not confirmed, the same convention as is_electricity_bill:
    # absent is never treated as an assertion. Only an explicit True counts.
    runtime_confirmed: Optional[bool] = None

class WorkingStep(BaseModel):
    label: str
    value: str

class Assumption(BaseModel):
    ok: bool
    text: str

class BreakdownItem(BaseModel):
    type: Union[ApplianceType, Literal["other"]]
    label: str
    units: float
    rupees: float
    percent: float
    rank: int
    working: Optional[List[WorkingStep]] = None
    assumptions: Optional[List[Assumption]] = None

class Action(BaseModel):
    tier: Literal["free", "cheap", "investment"]
    text: str
    saves_rupees: float
    payback_months: Optional[float] = None

class BiggestSurprise(BaseModel):
    type: ApplianceType
    label: str
    rupees: float
    line: str

class Solar(BaseModel):
    size_kw: float
    coverage_percent: float
    net_cost_rupees: float
    annual_saving_rupees: float
    payback_years: float

class Insights(BaseModel):
    efficiency_gap_percent: float
    efficiency_gap_rupees: float
    efficiency_driver: str
    energy_score: float
    co2_kg_year: float
    co2_kg_year_after: float
    monthly_savings_rupees: float
    annual_savings_rupees: float
    biggest_surprise: Optional[BiggestSurprise] = None
    solar: Optional[Solar] = None

class Meta(BaseModel):
    engine_version: str
    model: str
    generated_at: str
    duration_ms: float

class AnalyzeRequest(BaseModel):
    bill: BillData
    appliances: List[ApplianceInput]

class AnalyzeResponse(BaseModel):
    ok: Literal[True] = True
    bill_total_rupees: float
    breakdown: List[BreakdownItem]
    scale_factor: float
    confidence_percent: float
    confidence_reasons: List[Assumption]
    meta: Meta
    explanation: str
    actions: List[Action]
    insights: Insights

class ApiError(BaseModel):
    ok: Literal[False] = False
    reason: ErrorCode
    message: str
