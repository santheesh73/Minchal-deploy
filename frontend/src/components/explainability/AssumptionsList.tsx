import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Assumption } from '../../types/api';

export interface AssumptionsListProps {
  assumptions: Assumption[];
}

export const AssumptionsList: React.FC<AssumptionsListProps> = ({ assumptions }) => {
  if (!assumptions || assumptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-3 border-t border-slate-200">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <span>What MINCHAL Had To Assume (Assumptions)</span>
      </div>

      <div className="space-y-1.5 bg-amber-50/40 p-3 rounded-xl border border-amber-200/70 text-xs text-slate-700">
        {assumptions.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
