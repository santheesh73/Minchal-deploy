import React from 'react';
import { Sun } from 'lucide-react';
import { Insights } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface SolarCardProps {
  insights: Insights;
}

export const SolarCard: React.FC<SolarCardProps> = ({ insights }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

  const solar = insights?.solar;

  if (!solar) {
    return null;
  }

  return (
    <Card variant="default" className="p-5 space-y-4 bg-amber-50/30 border-amber-200">
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{t.solarTitle}</h3>
            <p className="text-[11px] text-slate-500">{state.language === 'ta' ? 'பரிந்துரைக்கப்பட்ட சோலார் அமைப்பு திறன்' : 'Recommended renewable generation capacity'}</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
          {solar.size_kw} kW {state.language === 'ta' ? 'அமைப்பு' : 'System'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'கட்டண அளவு மறைப்பு' : 'Bill Coverage'}</span>
          <p className="text-base font-bold text-amber-700 font-mono">
            {solar.coverage_percent}%
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'ஆண்டுச் சேமிப்பு' : 'Annual Savings'}</span>
          <p className="text-base font-bold text-emerald-600 font-mono">
            {formatEstimateRupees(solar.annual_saving_rupees)}
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'தோராய நிகர செலவு' : 'Estimated Net Cost'}</span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {formatEstimateRupees(solar.net_cost_rupees)}
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'திருப்பிச் செலுத்தும் காலம்' : 'Payback Period'}</span>
          <p className="text-base font-bold text-brand-600 font-mono">
            {solar.payback_years} {state.language === 'ta' ? 'ஆண்டுகள்' : 'yrs'}
          </p>
        </div>
      </div>
    </Card>
  );
};
