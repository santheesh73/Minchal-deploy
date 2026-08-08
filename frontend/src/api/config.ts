import { APP_CONFIG } from '../config/app';

export const API_CONFIG = {
  baseUrl: APP_CONFIG.apiBaseUrl,
  useMocks: APP_CONFIG.useMocks,
  endpoints: {
    health: '/api/health',
    extractBill: '/api/extract-bill',
    extractNameplate: '/api/extract-nameplate',
    analyze: '/api/analyze',
    whatif: '/api/whatif',
  },
};
