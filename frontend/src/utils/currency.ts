/**
 * MINCHAL Currency Formatting Utilities
 * Follows strict API guidance:
 * - Estimated rupee values: "about ₹X"
 * - Savings: "up to ₹X"
 */

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatEstimateRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'about ₹0';
  }
  return `about ₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatSavingsRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'up to ₹0';
  }
  return `up to ₹${Math.round(amount).toLocaleString('en-IN')}`;
}
