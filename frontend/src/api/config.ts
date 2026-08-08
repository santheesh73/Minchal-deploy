import { APP_CONFIG } from '../config/app';

export const API_CONFIG = {
  baseUrl: APP_CONFIG.apiBaseUrl,
  useMocks: APP_CONFIG.useMocks,
  endpoints: {
    // The backend serves /health, NOT /api/health — /api/health returns 404.
    health: '/health',
    extractBill: '/api/extract-bill',
    extractNameplate: '/api/extract-nameplate',
    // Manual-entry fallback for when OCR cannot read the bill. Same response
    // shape as extractBill, so it is a drop-in substitute.
    manualBill: '/api/manual-bill',
    analyze: '/api/analyze',
    whatif: '/api/whatif',
  },
};
