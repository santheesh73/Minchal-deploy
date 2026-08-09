import React, { useState } from 'react';
import { ListChecks, Filter } from 'lucide-react';
import { Action } from '../../types/api';
import { ActionCard } from './ActionCard';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface ActionSectionProps {
  actions: Action[];
  onViewActionDetails?: (action: Action) => void;
}

const APPLIANCE_FILTER_LABELS: Record<string, { en: string; ta: string }> = {
  all: { en: 'All Appliances', ta: 'அனைத்து சாதனங்களும்' },
  ac: { en: 'Air Conditioner', ta: 'ஏர் கண்டிஷனர்' },
  fridge: { en: 'Refrigerator', ta: 'குளிர்சாதனப் பெட்டி' },
  geyser: { en: 'Water Heater', ta: 'வாட்டர் ஹீட்டர்' },
  washing_machine: { en: 'Washing Machine', ta: 'வாஷிங் மெஷின்' },
  fan: { en: 'Fans', ta: 'மின்விசிறிகள்' },
  motor_pump: { en: 'Water Pump', ta: 'மோட்டார் பம்ப்' },
  tv: { en: 'Television', ta: 'தொலைக்காட்சி' },
  lights: { en: 'Lighting', ta: 'மின்விளக்குகள்' },
};

export const ActionSection: React.FC<ActionSectionProps> = ({ actions, onViewActionDetails }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);
  const isTa = state.language === 'ta';
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!actions || actions.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-medium">
        {t.noActionsMessage}
      </div>
    );
  }

  // Extract available appliance types from actions
  const availableTypes = Array.from(
    new Set(actions.map((act) => act.appliance_type).filter(Boolean))
  ) as string[];

  const filteredActions = selectedFilter === 'all'
    ? actions
    : actions.filter((act) => act.appliance_type === selectedFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-emerald-600" />
          <h2 className="text-h2 text-slate-900">{t.recommendedActionsTitle}</h2>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {actions.length} {isTa ? 'முன்னுரிமை நடவடிக்கைகள் (அனைத்து சாதனங்களுக்கும்)' : 'action recommendations across appliances'}
        </span>
      </div>

      {/* Appliance Filter Pills */}
      {availableTypes.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            {isTa ? 'வடிகட்டி:' : 'Filter:'}
          </span>

          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {APPLIANCE_FILTER_LABELS.all[isTa ? 'ta' : 'en']} ({actions.length})
          </button>

          {availableTypes.map((type) => {
            const count = actions.filter((a) => a.appliance_type === type).length;
            const labelObj = APPLIANCE_FILTER_LABELS[type] || { en: type, ta: type };
            const labelText = isTa ? labelObj.ta : labelObj.en;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFilter(type)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedFilter === type
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labelText} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredActions.map((act, idx) => (
          <ActionCard key={idx} action={act} onViewActionDetails={onViewActionDetails} />
        ))}
      </div>
    </div>
  );
};
