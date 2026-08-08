import React from 'react';
import { TrendingDown, Clock, HelpCircle } from 'lucide-react';
import { Action } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DataTrustLabel } from '../explainability/DataTrustLabel';

export interface ActionCardProps {
  action: Action;
  onViewActionDetails?: (action: Action) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onViewActionDetails }) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="success" size="sm">Free Habit</Badge>;
      case 'cheap':
        return <Badge variant="primary" size="sm">Low Cost</Badge>;
      case 'investment':
        return <Badge variant="warning" size="sm">Appliance Upgrade</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{tier}</Badge>;
    }
  };

  return (
    <Card variant="default" className="p-4 space-y-3 border-slate-200 hover:border-brand-300 transition-all bg-white flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTierBadge(action.tier)}
            <DataTrustLabel category="potential" />
          </div>

          {action.saves_rupees > 0 && (
            <span className="text-xs font-bold text-emerald-700 font-mono flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              saves ~{formatEstimateRupees(action.saves_rupees)} / mo
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
          {action.text}
        </p>

        {action.payback_months !== undefined && action.payback_months > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated payback period: <strong className="text-slate-700">{action.payback_months} months</strong></span>
          </div>
        )}
      </div>

      {onViewActionDetails && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onViewActionDetails(action)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline focus:outline-none flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Why this action?</span>
          </button>
        </div>
      )}
    </Card>
  );
};
