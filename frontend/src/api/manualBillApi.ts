import { apiClient } from './client';
import { API_CONFIG } from './config';
import { ExtractBillResponse } from '../types/api';

export interface ManualBillInput {
  units_consumed: number;
  total_amount: number;
  billing_days: number;
  tariff_slab: string;
}

/**
 * Manual-entry fallback — the break-glass path when OCR cannot read the bill.
 * Endpoint: POST /api/manual-bill
 *
 * Returns the SAME shape as extractBill, so everything downstream (confirm
 * screen, appliance picker, analyze) works unchanged. The backend runs these
 * numbers through the identical validation gate, so a typo is caught here the
 * same way a misread would have been.
 *
 * Deliberately does NOT honour useMocks: this path exists for when the real
 * backend is the only thing that can help, and quietly returning mock numbers
 * during a live failure is the one behaviour that would make it useless.
 */
export async function submitManualBill(
  input: ManualBillInput
): Promise<ExtractBillResponse> {
  return apiClient.request<ExtractBillResponse>(API_CONFIG.endpoints.manualBill, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
