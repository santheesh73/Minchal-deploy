import React from 'react';
import { Calculator } from 'lucide-react';
import { WorkingStep as WorkingStepType } from '../../types/api';
import { WorkingStep } from './WorkingStep';

export interface WorkingListProps {
  working: WorkingStepType[];
}

export const WorkingList: React.FC<WorkingListProps> = ({ working }) => {
  if (!working || working.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
        Detailed math steps are not specified for this estimate.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
        <Calculator className="w-4 h-4 text-brand-600" />
        <span>What MINCHAL Did (Calculation Math)</span>
      </div>

      <div className="space-y-1.5">
        {working.map((step, idx) => (
          <WorkingStep key={idx} index={idx + 1} step={step} />
        ))}
      </div>
    </div>
  );
};
