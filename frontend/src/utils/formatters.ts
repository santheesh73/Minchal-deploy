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
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
