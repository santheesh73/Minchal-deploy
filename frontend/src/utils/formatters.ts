/**
 * MINCHAL General Formatting Utilities
 */

export function formatUnits(units: number | null | undefined): string {
  if (units === null || units === undefined || isNaN(units)) {
    return '0 kWh';
  }
  return `${Math.round(units).toLocaleString('en-IN')} kWh`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${Math.round(value)}%`;
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'N/A';

  const raw = String(isoString).trim();
  if (!raw) return 'N/A';

  // Indian bills print DD/MM/YYYY (or DD-MM-YYYY), which `new Date()` either
  // rejects or silently reads as MM/DD — a real TNEB bill dated 30/06/2026
  // rendered as the literal string "Invalid Date" on three screens, including
  // the result dashboard. Parse it explicitly before falling back to Date.
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const parsed = dmy
    ? new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    : new Date(raw);

  // Never render "Invalid Date" at the user. Showing what the bill actually
  // said is always more useful than a JavaScript error string.
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
