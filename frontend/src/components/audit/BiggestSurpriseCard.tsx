import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Insights } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface BiggestSurpriseCardProps {
  insights: Insights;
}

const TA_LABEL_MAP: Record<string, string> = {
  ac: 'ஏர் கண்டிஷனர்',
  fridge: 'குளிர்சாதனப் பெட்டி',
  geyser: 'வாட்டர் ஹீட்டர்',
  washing_machine: 'துணி துவைக்கும் இயந்திரம்',
  fan: 'மின்விசிறி',
  tv: 'தொலைக்காட்சி',
  lights: 'மின்விளக்குகள்',
  motor_pump: 'மோட்டார் பம்ப்',
  other: 'மற்ற மின் பயன்பாடு',
};

export const BiggestSurpriseCard: React.FC<BiggestSurpriseCardProps> = ({ insights }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);
  const isTa = state.language === 'ta';

  const surprise = insights?.biggest_surprise;

  if (!surprise) {
    return null;
  }

  const displayLabel = isTa
    ? TA_LABEL_MAP[surprise.type] || surprise.label || surprise.type
    : surprise.label || surprise.type;

  return (
    <Card variant="default" className="p-5 space-y-3 bg-purple-50/40 border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{t.biggestSurpriseTitle}</h3>
            <p className="text-[11px] text-slate-500">{isTa ? 'எதிர்பாராத அதிக பயன்பாடு' : 'Unexpected load finding'}</p>
          </div>
        </div>

        {surprise.rupees > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 font-mono">
            ~{formatEstimateRupees(surprise.rupees)} / {isTa ? 'மாதம்' : 'mo'}
          </span>
        )}
      </div>

      <div className="p-3.5 bg-white rounded-xl border border-purple-200/80 space-y-1">
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
          {displayLabel}
        </span>
        <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
          "{surprise.line}"
        </p>
      </div>
    </Card>
  );
};
