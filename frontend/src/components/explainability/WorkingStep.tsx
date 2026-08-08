import React from 'react';
import { WorkingStep as WorkingStepType } from '../../types/api';

export interface WorkingStepProps {
  index: number;
  step: WorkingStepType;
}

export const WorkingStep: React.FC<WorkingStepProps> = ({ index, step }) => {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-3">
      <div className="flex items-center gap-2.5">
        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
          {index}
        </span>
        <span className="font-semibold text-slate-700">{step.label}</span>
      </div>
      <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
        {step.value}
      </span>
    </div>
  );
};
