import React from 'react';
import { ApplianceCatalogItem } from '../../config/appliances';

export interface CapacitySelectorProps {
  catalogItem: ApplianceCatalogItem;
  value: number | null;
  onChange: (val: number | null) => void;
}

export const CapacitySelector: React.FC<CapacitySelectorProps> = ({
  catalogItem,
  value,
  onChange,
}) => {
  if (!catalogItem.supportsCapacity) {
    return null;
  }

  const presets = catalogItem.capacityPresets || [];
  const unit = catalogItem.capacityUnit || 'units';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        Capacity ({unit})
      </label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {preset} {unit}
            </button>
          );
        })}
      </div>
    </div>
  );
};
