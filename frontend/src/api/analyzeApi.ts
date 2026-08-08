import { apiClient } from './client';
import { API_CONFIG } from './config';
import { AnalyzeRequest, AnalyzeResponse } from '../types/api';
import analyzeMock from '../mocks/analyze.json';

/**
 * Perform comprehensive household energy audit calculation & breakdown.
 * Endpoint: POST /api/analyze
 * Request Content-Type: application/json
 */
export async function analyzeAudit(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  if (API_CONFIG.useMocks) {
    // Simulate realistic 5-second backend analysis processing delay
    // to allow visual validation of the 3-stage loading sequence
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return analyzeMock as unknown as AnalyzeResponse;
  }

  return apiClient.request<AnalyzeResponse>(
    API_CONFIG.endpoints.analyze,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}
