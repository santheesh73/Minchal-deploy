import React from 'react';
import { Leaf } from 'lucide-react';
import { Insights } from '../../types/api';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface CO2CardProps {
  insights: Insights;
}

export const CO2Card: React.FC<CO2CardProps> = ({ insights }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

  const currentCO2 = insights?.co2_kg_year;
  const afterCO2 = insights?.co2_kg_year_after;

  if (currentCO2 === undefined || currentCO2 === null) {
    return null;
  }

  const annualReduction = afterCO2 !== undefined && afterCO2 !== null ? currentCO2 - afterCO2 : 0;

  return (
    <Card variant="default" className="p-5 space-y-4 bg-emerald-50/40 border-emerald-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{t.co2Title}</h3>
            <p className="text-[11px] text-slate-500">{state.language === 'ta' ? 'ஆண்டு வீட்டு உமிழ்வு தாக்கம்' : 'Annual household emissions impact'}</p>
          </div>
        </div>

        {annualReduction > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            -{annualReduction} kg CO₂ / {state.language === 'ta' ? 'ஆண்டு' : 'yr'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'தற்போதைய உமிழ்வு' : 'Current Footprint'}</span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {currentCO2} <span className="text-xs font-normal text-slate-500">kg/{state.language === 'ta' ? 'ஆண்டு' : 'yr'}</span>
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{state.language === 'ta' ? 'மேம்பாட்டிற்கு பின்' : 'Post-Optimization'}</span>
          <p className="text-base font-bold text-emerald-600 font-mono">
            {afterCO2 !== undefined && afterCO2 !== null ? afterCO2 : currentCO2} <span className="text-xs font-normal text-slate-500">kg/{state.language === 'ta' ? 'ஆண்டு' : 'yr'}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
