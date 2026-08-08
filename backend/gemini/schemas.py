"""Gemini-facing extraction schemas.

Deliberately separate from backend/schemas.py, which is the LOCKED frontend
contract and must stay non-optional.

Every field here is Optional because this is the schema handed to Gemini as
response_schema. A required float gives the model no way to say "not printed on
this bill" — it emits 0 instead of null, which then reaches validate_bill as a
real reading of zero and surfaces to the user as INVALID_BILL instead of the
correct OCR_MISSING_FIELD. Optional lets the model say nothing and lets the
validation gate classify the failure properly.
"""
from pydantic import BaseModel
from typing import Optional


class BillExtraction(BaseModel):
    # Not a bill field — a control field, which is why this schema can no longer
    # be field-for-field identical to BillData.
    #
    # A flat grey rectangle with no text on it returned units_consumed 496 and
    # total_amount 1440 (and 150 / 348 on another run — fabricated values differ
    # every time). Those numbers are plausible, so a numeric validation gate can
    # never catch them: it can only judge whether figures look reasonable, and
    # invented ones often do. The only place to catch it is here, by making the
    # model state up front whether it is even looking at a bill.
    #
    # This strengthens the pixels-to-numbers boundary rather than patching over
    # it — Gemini still reports only what it sees, and the engine still does
    # every calculation.
    is_electricity_bill: Optional[bool] = None

    units_consumed: Optional[float] = None
    total_amount: Optional[float] = None
    billing_days: Optional[int] = None
    period_end: Optional[str] = None
    tariff_slab: Optional[str] = None
    energy_charges: Optional[float] = None
    fixed_charges: Optional[float] = None
    taxes_and_duties: Optional[float] = None
    subsidy_applied: Optional[float] = None


class NameplateExtraction(BaseModel):
    appliance_type: Optional[str] = None
    rated_power_w: Optional[float] = None
    star_rating: Optional[float] = None
    capacity: Optional[float] = None
    manufacture_year: Optional[int] = None
