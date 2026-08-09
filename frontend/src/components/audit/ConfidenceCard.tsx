import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Assumption } from '../../types/api';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface ConfidenceCardProps {
  confidencePercent: number;
  reasons?: Assumption[];
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidencePercent,
  reasons = [],
}) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceLevel = (pct: number) => {
    if (state.language === 'ta') {
      if (pct >= 80) return { label: 'உயர்ந்த துல்லியம்', variant: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      if (pct >= 60) return { label: 'நல்ல துல்லியம்', variant: 'bg-blue-100 text-blue-800 border-blue-300' };
      return { label: 'மிதமான துல்லியம்', variant: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (pct >= 80) return { label: 'High Confidence', variant: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (pct >= 60) return { label: 'Good Confidence', variant: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'Moderate Confidence', variant: 'bg-amber-100 text-amber-800 border-amber-300' };
  };

  const level = getConfidenceLevel(confidencePercent);

  return (
    <Card variant="default" className="p-5 space-y-3 bg-white border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{t.confidenceTitle}</h3>
            <p className="text-[11px] text-slate-500">{state.language === 'ta' ? 'கட்டணம் மற்றும் சாதன விவரங்களின் அடிப்படையில்' : 'Based on bill clarity & appliance details'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-mono text-slate-900">
            {confidencePercent}%
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${level.variant}`}>
            {level.label}
          </span>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 focus:outline-none"
          >
            <span>{isExpanded ? (state.language === 'ta' ? 'விவரங்களை மறை' : 'Hide confidence details') : (state.language === 'ta' ? 'விவரங்களைக் காட்டு' : 'View confidence factors')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              {reasons.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {r.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};
