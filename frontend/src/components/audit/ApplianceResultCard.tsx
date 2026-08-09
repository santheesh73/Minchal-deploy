import React from 'react';
import {
  Snowflake,
  Refrigerator,
  Flame,
  Shirt,
  Fan,
  Tv,
  Lightbulb,
  Gauge,
  TrendingUp,
} from 'lucide-react';
import { BreakdownItem } from '../../types/api';
import { getApplianceCatalogItem } from '../../config/appliances';
import { formatEstimateRupees, formatUnits } from '../../utils';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { DataTrustLabel } from '../explainability/DataTrustLabel';
import { useAudit } from '../../store/AuditContext';

export interface ApplianceResultCardProps {
  item: BreakdownItem;
  onViewWorking?: (item: BreakdownItem) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ac: Snowflake,
  fridge: Refrigerator,
  geyser: Flame,
  washing_machine: Shirt,
  fan: Fan,
  tv: Tv,
  lights: Lightbulb,
  motor_pump: Gauge,
};

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

export const ApplianceResultCard: React.FC<ApplianceResultCardProps> = ({
  item,
  onViewWorking,
}) => {
  const { state } = useAudit();
  const isTa = state.language === 'ta';

  const catalog = item.type !== 'other' ? getApplianceCatalogItem(item.type) : undefined;
  const IconComponent = (item.type !== 'other' && ICON_MAP[item.type]) || Flame;

  const isHighestRank = item.rank === 1;

  // Determine display label: if Tamil is active, use Tamil label unless custom name given
  const displayLabel = isTa
    ? TA_LABEL_MAP[item.type] || item.label || item.type
    : item.label || catalog?.label || item.type;

  return (
    <Card
      variant="default"
      className={`p-4 space-y-3 relative transition-all ${
        isHighestRank ? 'border-amber-300 bg-amber-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isHighestRank
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-brand-50 text-brand-600'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                {displayLabel}
              </h4>
              <DataTrustLabel category="estimated" />
            </div>
            <span className="text-[11px] text-slate-500">
              {isTa ? `வரிசை #${item.rank} மின் நுகர்வு காரணி` : `Rank #${item.rank} load contributor`}
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isHighestRank
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.percent}% {isTa ? 'பங்கு' : 'share'}
        </span>
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            {isTa ? 'மாதாந்திர செலவு' : 'Monthly Cost'}
          </span>
          <p className="font-bold text-slate-900 font-mono text-sm">
            {formatEstimateRupees(item.rupees)}
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            {isTa ? 'மின் நுகர்வு' : 'Energy Consumption'}
          </span>
          <p className="font-bold text-brand-600 font-mono text-sm">
            {formatUnits(item.units)}
          </p>
        </div>
      </div>

      {/* Usage Share Percentage Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span>{isTa ? 'வீட்டு மின்சாரப் பங்கு' : 'Household Share'}</span>
          <span className="font-mono text-slate-900">{item.percent}%</span>
        </div>
        <ProgressBar
          value={item.percent}
          color={isHighestRank ? 'warning' : 'primary'}
          height="sm"
        />
      </div>

      {/* Calculation Transparency / Working Trigger */}
      {onViewWorking && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-slate-400" />
            {item.working?.length || 0} {isTa ? 'கணக்கீட்டு படிகள்' : 'math steps'}
          </span>
          <button
            type="button"
            onClick={() => onViewWorking(item)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline focus:outline-none"
          >
            {isTa ? 'இது எவ்வாறு கணக்கிடப்பட்டது?' : 'How was this estimated?'}
          </button>
        </div>
      )}
    </Card>
  );
};
