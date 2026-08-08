import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BreakdownItem } from '../../types/api';
import { ApplianceResultCard } from './ApplianceResultCard';

export interface ApplianceBreakdownProps {
  breakdown: BreakdownItem[];
  onViewWorking?: (item: BreakdownItem) => void;
}

export const ApplianceBreakdown: React.FC<ApplianceBreakdownProps> = ({
  breakdown,
  onViewWorking,
}) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        Appliance breakdown data is currently unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h2 className="text-h2 text-slate-900">Appliance Load & Cost Attribution</h2>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {breakdown.length} categories ranked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakdown.map((item, idx) => (
          <ApplianceResultCard
            key={`${item.type}-${idx}`}
            item={item}
            onViewWorking={onViewWorking}
          />
        ))}
      </div>
    </div>
  );
};
