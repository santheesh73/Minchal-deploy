import { AnalyzeResponse, ApplianceType } from '../types/api';

const SUPPORTED_APPLIANCE_TYPES: ApplianceType[] = [
  'ac',
  'fridge',
  'geyser',
  'washing_machine',
  'fan',
  'tv',
  'lights',
  'motor_pump',
];

export function validateAnalyzeResponse(data: any): { valid: boolean; normalized?: AnalyzeResponse } {
  if (!data || typeof data !== 'object') {
    return { valid: false };
  }

  if (data.ok !== true || typeof data.bill_total_rupees !== 'number') {
    return { valid: false };
  }

  // Normalize breakdown array handling unknown appliance types gracefully
  const normalizedBreakdown = Array.isArray(data.breakdown)
    ? data.breakdown.map((item: any) => ({
        ...item,
        type: SUPPORTED_APPLIANCE_TYPES.includes(item.type) ? item.type : ('other' as const),
        label: item.label || item.type || 'Appliance',
        units: typeof item.units === 'number' ? item.units : 0,
        rupees: typeof item.rupees === 'number' ? item.rupees : 0,
        percent: typeof item.percent === 'number' ? item.percent : 0,
        rank: typeof item.rank === 'number' ? item.rank : 99,
        working: Array.isArray(item.working) ? item.working : [],
        assumptions: Array.isArray(item.assumptions) ? item.assumptions : [],
      }))
    : [];

  const normalizedResponse: AnalyzeResponse = {
    ...data,
    breakdown: normalizedBreakdown,
    confidence_percent: typeof data.confidence_percent === 'number' ? data.confidence_percent : 80,
    confidence_reasons: Array.isArray(data.confidence_reasons) ? data.confidence_reasons : [],
    actions: Array.isArray(data.actions) ? data.actions : [],
    insights: data.insights || {},
    explanation: data.explanation || 'Household energy audit complete.',
  };

  return { valid: true, normalized: normalizedResponse };
}
