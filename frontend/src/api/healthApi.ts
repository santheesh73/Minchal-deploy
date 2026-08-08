import { apiClient } from './client';
import { API_CONFIG } from './config';

export interface HealthResponse {
  ok: boolean;
  status?: string;
  version?: string;
}

/**
 * Check backend API health and status.
 * Endpoint: GET /api/health
 */
export async function checkHealth(): Promise<HealthResponse> {
  if (API_CONFIG.useMocks) {
    return { ok: true, status: 'healthy (mock)', version: '1.0.0-mock' };
  }

  return apiClient.request<HealthResponse>(API_CONFIG.endpoints.health, {
    method: 'GET',
  });
}
