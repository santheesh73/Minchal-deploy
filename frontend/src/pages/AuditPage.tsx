import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../store/AuditContext';
import { AnalyzeRequest } from '../types/api';
import { useExplainability } from '../hooks/useExplainability';
import { validateAnalyzeResponse } from '../utils/responseValidation';
import {
  extractApplianceExplainability,
  extractActionExplainability,
  extractOverallExplainability,
} from '../utils/explainabilityMapper';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import {
  AuditHeader,
  ConfidenceCard,
  BillSummaryCard,
  AuditSummaryStrip,
  ApplianceBreakdown,
  EfficiencyGapCard,
  BiggestSurpriseCard,
  ActionSection,
  BudgetPlanner,
  CO2Card,
  SolarCard,
  AuditEmptyState,
} from '../components/audit';
import { ExplainabilityDrawer } from '../components/explainability/ExplainabilityDrawer';

export const AuditPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAudit();
  const rawResult = state.analysisResult;

  // Rebuilt exactly as useAnalysis builds it, so /api/plan-budget re-runs the
  // SAME analysis and cannot return different rupee figures from the ones
  // already on screen. Whitelisted for the same reason: this payload is a
  // whitelist, and a field not listed is silently dropped.
  const analyzeRequest: AnalyzeRequest | null =
    state.billData && state.appliances?.length
      ? {
          bill: {
            ...state.billData,
            units_consumed: Number(state.billData.units_consumed),
            total_amount: Number(state.billData.total_amount),
            billing_days: state.billData.billing_days ? Math.round(Number(state.billData.billing_days)) : 60,
          },
          appliances: state.appliances.map((app) => ({
            id: app.id,
            type: app.type,
            capacity: app.capacity !== null && app.capacity !== undefined ? Number(app.capacity) : null,
            star: app.star ? Math.round(Number(app.star)) : 3,
            year: app.year ? Math.round(Number(app.year)) : 2022,
            hours_band: app.type === 'fridge' || !app.hours_band ? null : app.hours_band,
            symptoms: Array.isArray(app.symptoms) ? app.symptoms : [],
            runtime_confirmed: app.runtime_confirmed === true,
            rated_power_w: app.rated_power_w !== null && app.rated_power_w !== undefined ? Number(app.rated_power_w) : null,
            label: app.label ? String(app.label).trim() : null,
          })),
          language: state.language || 'en',
        }
      : null;
  const { activeContext, isOpen, openExplainability, closeExplainability } = useExplainability();

  // Track language changes to re-analyze if language toggle is switched on result page
  const prevLangRef = React.useRef(state.language);
  React.useEffect(() => {
    if (prevLangRef.current !== state.language) {
      prevLangRef.current = state.language;
      if (state.billData && state.appliances?.length) {
        navigate('/audit/analyzing');
      }
    }
  }, [state.language, state.billData, state.appliances, navigate]);

  if (!rawResult) {
    return (
      <PageContainer maxWidth="md" className="py-8 sm:py-12">
        <AuditEmptyState />
      </PageContainer>
    );
  }

  const { valid, normalized: result } = validateAnalyzeResponse(rawResult);

  if (!valid || !result) {
    return (
      <PageContainer maxWidth="md" className="py-8 sm:py-12">
        <AuditEmptyState />
      </PageContainer>
    );
  }

  // Detect stale audit inputs
  const isStale = Boolean(
    state.billData &&
      result &&
      state.billData.total_amount !== result.bill_total_rupees
  );

  const handleReanalyze = () => {
    navigate('/audit/analyzing');
  };

  return (
    <PageContainer maxWidth="lg" className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Header with Stale Audit Warning support */}
      <ErrorBoundary fallbackTitle="Header Unavailable">
        <AuditHeader
          explanation={result.explanation}
          isStale={isStale}
          onReanalyze={handleReanalyze}
        />
      </ErrorBoundary>

      {/* 2. Confidence & Bill Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <ErrorBoundary fallbackTitle="Confidence Section Unavailable">
          <div
            onClick={() => openExplainability(extractOverallExplainability(result))}
            className="cursor-pointer"
          >
            <ConfidenceCard
              confidencePercent={result.confidence_percent}
              reasons={result.confidence_reasons}
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary fallbackTitle="Bill Summary Unavailable">
          <BillSummaryCard billTotalRupees={result.bill_total_rupees} />
        </ErrorBoundary>
      </div>

      {/* 3. Hero Key Energy Summary Strip */}
      <ErrorBoundary fallbackTitle="Summary Strip Unavailable">
        <AuditSummaryStrip result={result} />
      </ErrorBoundary>

      {/* 4. Appliance Breakdown & Cost Attribution */}
      <ErrorBoundary fallbackTitle="Appliance Breakdown Unavailable">
        <ApplianceBreakdown
          breakdown={result.breakdown}
          onViewWorking={(item) => openExplainability(extractApplianceExplainability(item))}
        />
      </ErrorBoundary>

      {/* 5. Efficiency Opportunity Gap & Biggest Surprise */}
      {result.insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary fallbackTitle="Efficiency Gap Card Unavailable">
            <EfficiencyGapCard insights={result.insights} />
          </ErrorBoundary>

          <ErrorBoundary fallbackTitle="Biggest Surprise Card Unavailable">
            <BiggestSurpriseCard insights={result.insights} />
          </ErrorBoundary>
        </div>
      )}

      {/* 6. Recommended Actions Section */}
      <ErrorBoundary fallbackTitle="Actions Section Unavailable">
        <ActionSection
          actions={result.actions}
          onViewActionDetails={(action) => openExplainability(extractActionExplainability(action))}
        />
      </ErrorBoundary>

      {/* 6b. Budget-constrained plan — deterministic, no AI call */}
      <ErrorBoundary fallbackTitle="Budget Planner Unavailable">
        <BudgetPlanner request={analyzeRequest} />
      </ErrorBoundary>

      {/* 7. CO2 Environmental Footprint & Solar Opportunity */}
      {result.insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary fallbackTitle="CO2 Section Unavailable">
            <CO2Card insights={result.insights} />
          </ErrorBoundary>

          <ErrorBoundary fallbackTitle="Solar Section Unavailable">
            <SolarCard insights={result.insights} />
          </ErrorBoundary>
        </div>
      )}

      {/* 8. Explainability Drawer */}
      <ExplainabilityDrawer
        context={activeContext}
        isOpen={isOpen}
        onClose={closeExplainability}
      />
    </PageContainer>
  );
};
