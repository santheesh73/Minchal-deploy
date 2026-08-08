import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Spinner } from '../ui';

export interface AnalysisStepProps {
  stepNumber: number;
  label: string;
  sublabel: string;
  status: 'pending' | 'active' | 'completed';
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({
  stepNumber,
  label,
  sublabel,
  status,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
        status === 'completed'
          ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
          : status === 'active'
          ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20 shadow-sm text-slate-900'
          : 'bg-slate-50 border-slate-200/60 opacity-60 text-slate-500'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-colors ${
            status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'active'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            stepNumber
          )}
        </div>

        <div className="space-y-0.5 text-left">
          <h4 className="font-bold text-sm leading-tight">{label}</h4>
          <p className="text-xs text-slate-500">{sublabel}</p>
        </div>
      </div>

      <div>
        {status === 'completed' && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
            Done
          </span>
        )}
        {status === 'active' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
            <Spinner size="sm" color="primary" />
            <span>Processing</span>
          </div>
        )}
        {status === 'pending' && (
          <span className="text-xs font-medium text-slate-400">Waiting</span>
        )}
      </div>
    </div>
  );
};
