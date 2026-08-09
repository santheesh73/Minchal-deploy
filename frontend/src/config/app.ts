/**
 * MINCHAL Application Configuration
 */

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    // If accessed via local network IP (e.g. 192.168.x.x) or domain without explicit env var
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
}

export const APP_CONFIG = {
  name: 'MINCHAL',
  tagline: 'Household Electricity Energy Audit',
  version: '1.0.0-m1',
  get apiBaseUrl() {
    return getApiBaseUrl();
  },
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true', // Only use mocks when explicitly set to 'true'
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'ta'] as const,
  currencySymbol: '₹',
  maxBillUploadSizeBytes: 10 * 1024 * 1024, // 10MB limit
  supportedBillFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};
