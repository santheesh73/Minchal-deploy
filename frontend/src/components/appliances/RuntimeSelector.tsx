import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { HoursBand, ApplianceType } from '../../types/api';

export interface RuntimeSelectorProps {
  applianceType: ApplianceType;
  value: HoursBand | null;
  onChange: (band: HoursBand | null) => void;
}

export const RuntimeSelector: React.FC<RuntimeSelectorProps> = ({
  applianceType,
  value,
  onChange,
}) => {
  // REFRIGERATOR SPECIAL CASE: Refrigerator hours_band is strictly null (Always on 24/7)
  if (applianceType === 'fridge') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-600" />
          Daily Runtime
        </label>
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-900 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Always on (24/7 Base Load)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-bold font-mono">
            hours_band: null
          </span>
        </div>
      </div>
    );
  }

  const bands: { value: HoursBand; label: string }[] = [
    { value: '0-1', label: '0–1 hrs/day' },
    { value: '1-2', label: '1–2 hrs/day' },
    { value: '2-4', label: '2–4 hrs/day' },
    { value: '4-6', label: '4–6 hrs/day' },
    { value: '6-8', label: '6–8 hrs/day' },
    { value: '8+', label: '8+ hrs/day' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-600" />
          Estimated Daily Runtime
        </label>
        {value && (
          <span className="text-xs font-bold text-brand-600 font-mono">
            {value} hrs/day
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {bands.map((b) => {
          const isSelected = value === b.value;
          return (
            <button
              key={b.value}
              type="button"
              onClick={() => onChange(b.value)}
              className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:border-brand-300'
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
