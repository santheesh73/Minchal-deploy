/**
 * MINCHAL Application Configuration
 */

export const APP_CONFIG = {
  name: 'MINCHAL',
  tagline: 'Household Electricity Energy Audit',
  version: '1.0.0-m1',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false', // Default to true if omitted or 'true'
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'ta'] as const,
  currencySymbol: '₹',
  maxBillUploadSizeBytes: 10 * 1024 * 1024, // 10MB limit
  supportedBillFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};
