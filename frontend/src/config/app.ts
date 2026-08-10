/**
 * MINCHAL Application Configuration
 */

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname)
  ) {
    // If accessed via local network IP (e.g. 192.168.x.x) during local testing
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
