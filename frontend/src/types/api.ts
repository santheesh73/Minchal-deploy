export type ApplianceType = "ac"|"fridge"|"geyser"|"washing_machine"|"fan"|"tv"|"lights"|"motor_pump";
export type HoursBand = "0-1"|"1-2"|"2-4"|"4-6"|"6-8"|"8+";
export type ErrorCode = "OCR_BLUR"|"OCR_MISSING_FIELD"|"INVALID_BILL"|"APPLIANCE_UNKNOWN"|"SERVER_ERROR";

export interface BillData {
  units_consumed: number; total_amount: number; billing_days: number;
  period_end: string; tariff_slab: string;
  energy_charges: number|null; fixed_charges: number|null;
  taxes_and_duties: number|null; subsidy_applied: number|null;
  // consumer name/number/address are DELIBERATELY NEVER EXTRACTED (privacy)
}

export type ExtractBillResponse = BillData;

export interface NameplateData {
  appliance_type: ApplianceType; rated_power_w: number|null;
  star_rating: number|null; capacity: number|null; manufacture_year: number|null;
}
export interface ApplianceInput {
  id: string; type: ApplianceType; capacity: number|null; star: number;
  year: number; hours_band: HoursBand|null; symptoms: string[];
  // Additive & optional. hours_band is pre-filled with a sensible default the
  // moment an appliance is added, so its presence cannot answer "did the user
  // tell us, or did we assume?". Only set true when the user actually opens
  // the config modal and saves. Absent/false = assumed, and confidence says so.
  runtime_confirmed?: boolean;
}

export interface AnalyzeRequest {
  bill: BillData;
  appliances: ApplianceInput[];
  language: "en" | "ta";
}

export interface WorkingStep { label: string; value: string; }
export interface Assumption { ok: boolean; text: string; }
export interface BreakdownItem {
  type: ApplianceType|"other"; label: string; units: number; rupees: number;
  percent: number; rank: number; working?: WorkingStep[]; assumptions?: Assumption[];
}
export interface Action {
  tier: "free"|"cheap"|"investment"; text: string;
  saves_rupees: number; payback_months?: number;
  // Additive: one-off cost of doing this action. 0 for free habit changes.
  cost_rupees?: number;
}
export interface ExcludedAction {
  tier: "free"|"cheap"|"investment"; text: string;
  cost_rupees: number; saves_rupees: number;
  annual_saving_rupees: number; reason: string;
}
export interface BudgetPlan {
  budget_rupees: number;
  selected: Action[];
  excluded: ExcludedAction[];
  total_cost_rupees: number;
  total_annual_saving_rupees: number;
  budget_remaining_rupees: number;
}
export interface PlanBudgetRequest extends AnalyzeRequest { budget_rupees: number; }
export type PlanBudgetResponse = AnalyzeResponse & { budget_plan: BudgetPlan };
export interface Insights {
  efficiency_gap_percent: number; efficiency_gap_rupees: number;
  efficiency_driver: string; energy_score: number;
  co2_kg_year: number; co2_kg_year_after: number;
  monthly_savings_rupees: number; annual_savings_rupees: number;
  biggest_surprise: { type: ApplianceType; label: string; rupees: number; line: string } | null;
  solar: { size_kw: number; coverage_percent: number; net_cost_rupees: number;
           annual_saving_rupees: number; payback_years: number } | null;
}
export interface AnalyzeResponse {
  ok: true; bill_total_rupees: number; breakdown: BreakdownItem[];
  scale_factor: number; confidence_percent: number; confidence_reasons: Assumption[];
  meta: { engine_version: string; model: string; generated_at: string; duration_ms: number };
  explanation: string; actions: Action[]; insights: Insights;
}
export interface ApiError { ok: false; reason: ErrorCode; message: string; }
