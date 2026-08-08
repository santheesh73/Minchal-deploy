import React from 'react';
import { TrendingDown } from 'lucide-react';
import { Insights } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';

export interface EfficiencyGapCardProps {
  insights: Insights;
}

export const EfficiencyGapCard: React.FC<EfficiencyGapCardProps> = ({ insights }) => {
  const rupeesGap = insights?.efficiency_gap_rupees;
  const percentGap = insights?.efficiency_gap_percent;
  const driver = insights?.efficiency_driver;

  if (rupeesGap === null || rupeesGap === undefined) {
    return null;
  }

  return (
    <Card variant="default" className="p-5 space-y-3 bg-amber-50/30 border-amber-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Efficiency Opportunity Gap</h3>
            <p className="text-[11px] text-slate-500">Avoidable excess power consumption</p>
          </div>
        </div>

        {percentGap !== undefined && percentGap !== null && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {percentGap}% gap
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Potential Cost Recovery</span>
          <p className="text-base font-bold text-amber-700 font-mono">
            up to {formatEstimateRupees(rupeesGap)} / month
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Primary Gap Driver</span>
          <p className="text-xs font-bold text-slate-900 truncate">
            {driver || 'Appliance Age & Efficiency'}
          </p>
        </div>
      </div>
    </Card>
  );
};
