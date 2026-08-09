import React from 'react';
import { TrendingDown } from 'lucide-react';
import { Insights } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface EfficiencyGapCardProps {
  insights: Insights;
}

export const EfficiencyGapCard: React.FC<EfficiencyGapCardProps> = ({ insights }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

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
            <h3 className="font-bold text-slate-900 text-sm">{t.efficiencyGapTitle}</h3>
            <p className="text-[11px] text-slate-500">{state.language === 'ta' ? 'தவிர்க்கக்கூடிய கூடுதல் மின் நுகர்வு' : 'Avoidable excess power consumption'}</p>
          </div>
        </div>

        {percentGap !== undefined && percentGap !== null && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {percentGap}% {state.language === 'ta' ? 'இடைவெளி' : 'gap'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'மீட்கக்கூடிய சாத்தியமான செலவு' : 'Potential Cost Recovery'}</span>
          <p className="text-base font-bold text-amber-700 font-mono">
            {state.language === 'ta' ? 'மாதம் சுமார்' : 'up to'} {formatEstimateRupees(rupeesGap)}
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'முதன்மை மின் நுகர்வு காரணி' : 'Primary Gap Driver'}</span>
          <p className="text-xs font-bold text-slate-900 truncate">
            {driver || (state.language === 'ta' ? 'சாதன வயது & திறன்' : 'Appliance Age & Efficiency')}
          </p>
        </div>
      </div>
    </Card>
  );
};
