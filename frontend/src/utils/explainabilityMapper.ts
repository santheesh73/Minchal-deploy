import { WorkingStep, Assumption, BreakdownItem, Action, AnalyzeResponse } from '../types/api';

export interface ExplainabilityContext {
  title: string;
  subtitle?: string;
  working: WorkingStep[];
  assumptions: Assumption[];
  confidencePercent?: number;
  confidenceReasons?: Assumption[];
}

export function extractApplianceExplainability(item: BreakdownItem): ExplainabilityContext {
  return {
    title: item.label || item.type,
    subtitle: `Appliance Load Attribution • Rank #${item.rank}`,
    working: Array.isArray(item.working) ? item.working : [],
    assumptions: Array.isArray(item.assumptions) ? item.assumptions : [],
  };
}

export function extractActionExplainability(action: Action): ExplainabilityContext {
  return {
    title: action.text,
    subtitle: `Recommended Energy Saving Action (${action.tier.toUpperCase()} Tier)`,
    working: [],
    assumptions: action.payback_months
      ? [{ ok: true, text: `Estimated payback period of ~${action.payback_months} months.` }]
      : [],
  };
}

export function extractOverallExplainability(response: AnalyzeResponse): ExplainabilityContext {
  return {
    title: 'Household Energy Audit Confidence',
    subtitle: 'Overall Model Transparency & Confidence Factors',
    working: [],
    assumptions: [],
    confidencePercent: response.confidence_percent,
    confidenceReasons: Array.isArray(response.confidence_reasons) ? response.confidence_reasons : [],
  };
}
