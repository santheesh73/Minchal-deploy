from pydantic import BaseModel
from typing import List, Optional, Literal

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

class NameplateData(BaseModel):
    appliance_type: str
    rated_power_w: Optional[float] = None
    star_rating: Optional[float] = None
    capacity: Optional[float] = None
    manufacture_year: Optional[int] = None
