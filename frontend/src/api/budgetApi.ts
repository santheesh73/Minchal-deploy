import { apiClient } from './client';
import { API_CONFIG } from './config';
import { AnalyzeRequest, PlanBudgetResponse } from '../types/api';

/**
 * Plan which actions fit a budget.
 * Endpoint: POST /api/plan-budget
 *
 * Returns the standard analyze response plus a budget_plan. No AI call is made
 * anywhere in this path — the plan is arithmetic over figures the deterministic
 * engine already produced, which is precisely why it is not a chat box.
 */
export async function planBudget(
  request: AnalyzeRequest,
  budgetRupees: number
): Promise<PlanBudgetResponse> {
  return apiClient.request<PlanBudgetResponse>(API_CONFIG.endpoints.planBudget, {
    method: 'POST',
    body: JSON.stringify({ ...request, budget_rupees: budgetRupees }),
  });
}
