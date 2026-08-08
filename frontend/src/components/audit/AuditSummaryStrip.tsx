import React from 'react';
import { Tag, TrendingDown, Award, Flame } from 'lucide-react';
import { AnalyzeResponse } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';

export interface AuditSummaryStripProps {
  result: AnalyzeResponse;
}

export const AuditSummaryStrip: React.FC<AuditSummaryStripProps> = ({ result }) => {
  const topAppliance = result.breakdown && result.breakdown.length > 0 ? result.breakdown[0] : null;
  const energyScore = result.insights?.energy_score ?? 75;
  const potentialSavings = result.insights?.monthly_savings_rupees ?? result.insights?.efficiency_gap_rupees ?? 0;

  return (
    <Card variant="brand" className="p-5 sm:p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white shadow-soft-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {/* Metric 1: Total Billed */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-emerald-300" />
            Bill Total
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatEstimateRupees(result.bill_total_rupees)}
          </p>
          <span className="text-[10px] text-brand-200 block">Extracted bill amount</span>
        </div>

        {/* Metric 2: Top Contributor */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            Top Load Driver
          </span>
          <p className="text-base sm:text-lg font-bold text-white truncate">
            {topAppliance?.label || 'AC'}
          </p>
          <span className="text-[10px] text-amber-200 block">
            {topAppliance ? `${topAppliance.percent}% of total bill` : 'Highest energy share'}
          </span>
        </div>

        {/* Metric 3: Potential Monthly Savings */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
            Potential Savings
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
            {potentialSavings > 0 ? `up to ${formatEstimateRupees(potentialSavings)}` : 'Optimized'}
          </p>
          <span className="text-[10px] text-emerald-200 block">Estimated monthly recovery</span>
        </div>

        {/* Metric 4: Energy Efficiency Score */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-300" />
            Energy Score
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-purple-200">
            {energyScore} / 100
          </p>
          <span className="text-[10px] text-purple-200 block">Household rating</span>
        </div>
      </div>
    </Card>
  );
};
