import { API_CONFIG } from './config';
import { ApiError } from '../types/api';

export class ApiClientError extends Error {
  public reason: ApiError['reason'];

  constructor(reason: ApiError['reason'], message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.reason = reason;
  }
}

export const apiClient = {
  /**
   * Generic request handler that checks USE_MOCKS and routes to mock or real endpoint.
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    mockData?: T
  ): Promise<T> {
    if (API_CONFIG.useMocks) {
      // Simulate realistic API network latency (400ms - 800ms)
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (mockData) {
        return mockData;
      }
    }

    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});

    // Default to JSON content-type if body is not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok || (data && data.ok === false)) {
        const errorData: ApiError = data.ok === false ? data : {
          ok: false,
          reason: 'SERVER_ERROR',
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
        throw new ApiClientError(errorData.reason, errorData.message);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(
        'SERVER_ERROR',
        err?.message || 'Failed to connect to the MINCHAL backend server.'
      );
    }
  },
};
