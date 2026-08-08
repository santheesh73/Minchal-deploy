import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Assumption } from '../../types/api';

export interface ConfidenceReasonsProps {
  reasons: Assumption[];
}

export const ConfidenceReasons: React.FC<ConfidenceReasonsProps> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">No additional confidence factors provided.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Confidence Factors</span>
      </div>

      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
        {reasons.map((r, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {r.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
