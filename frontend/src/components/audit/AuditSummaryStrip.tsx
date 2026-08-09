import React from 'react';
import { Tag, TrendingDown, Award, Flame } from 'lucide-react';
import { AnalyzeResponse } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { useAudit } from '../../store/AuditContext';

export interface AuditSummaryStripProps {
  result: AnalyzeResponse;
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

export const AuditSummaryStrip: React.FC<AuditSummaryStripProps> = ({ result }) => {
  const { state } = useAudit();
  const isTa = state.language === 'ta';

  const topAppliance = result.breakdown && result.breakdown.length > 0 ? result.breakdown[0] : null;
  const energyScore = result.insights?.energy_score ?? 75;
  const potentialSavings = result.insights?.monthly_savings_rupees ?? result.insights?.efficiency_gap_rupees ?? 0;

  const topLabel = topAppliance
    ? (isTa ? TA_LABEL_MAP[topAppliance.type] || topAppliance.label : topAppliance.label)
    : (isTa ? 'ஏர் கண்டிஷனர்' : 'AC');

  return (
    <Card variant="brand" className="p-5 sm:p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white shadow-soft-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {/* Metric 1: Total Billed */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-emerald-300" />
            {isTa ? 'மொத்தக் கட்டணம்' : 'Bill Total'}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatEstimateRupees(result.bill_total_rupees)}
          </p>
          <span className="text-[10px] text-brand-200 block">
            {isTa ? 'கட்டண ரசீது தொகை' : 'Extracted bill amount'}
          </span>
        </div>

        {/* Metric 2: Top Contributor */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            {isTa ? 'முதன்மை மின் நுகர்வு காரணி' : 'Top Load Driver'}
          </span>
          <p className="text-base sm:text-lg font-bold text-white truncate">
            {topLabel}
          </p>
          <span className="text-[10px] text-amber-200 block">
            {topAppliance
              ? (isTa ? `மொத்த கட்டணத்தில் ${topAppliance.percent}%` : `${topAppliance.percent}% of total bill`)
              : (isTa ? 'அதிகபட்ச பயன்பாட்டு பங்கு' : 'Highest energy share')}
          </span>
        </div>

        {/* Metric 3: Potential Monthly Savings */}
        <div className="space-y-1 border-r border-white/10 pr-3">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
            {isTa ? 'சாத்தியமான சேமிப்பு' : 'Potential Savings'}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
            {potentialSavings > 0 ? (isTa ? `சுமார் ${formatEstimateRupees(potentialSavings)}` : `up to ${formatEstimateRupees(potentialSavings)}`) : (isTa ? 'சிறந்த நிலையில் உள்ளது' : 'Optimized')}
          </p>
          <span className="text-[10px] text-emerald-200 block">
            {isTa ? 'மாதாந்திர சேமிப்பு கணக்கீடு' : 'Estimated monthly recovery'}
          </span>
        </div>

        {/* Metric 4: Energy Efficiency Score */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-brand-200 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-300" />
            {isTa ? 'ஆற்றல் திறன் மதிப்பெண்' : 'Energy Score'}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-purple-200">
            {energyScore} / 100
          </p>
          <span className="text-[10px] text-purple-200 block">
            {isTa ? 'வீட்டு தரவரிசை' : 'Household rating'}
          </span>
        </div>
      </div>
    </Card>
  );
};
