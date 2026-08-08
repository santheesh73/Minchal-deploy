import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ApplianceCatalogItem } from '../../config/appliances';
import { Chip } from '../ui/Chip';

export interface SymptomSelectorProps {
  catalogItem: ApplianceCatalogItem;
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  catalogItem,
  selectedSymptoms,
  onChange,
}) => {
  const options = catalogItem.symptomOptions || [];

  if (options.length === 0) {
    return null;
  }

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onChange(selectedSymptoms.filter((id) => id !== symptomId));
    } else {
      onChange([...selectedSymptoms, symptomId]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Observed Performance Issues (Optional)
        </label>
        {selectedSymptoms.length > 0 && (
          <span className="text-xs text-amber-700 font-semibold">
            {selectedSymptoms.length} selected
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((opt) => {
          const isSelected = selectedSymptoms.includes(opt.id);
          return (
            <Chip
              key={opt.id}
              selected={isSelected}
              onClick={() => toggleSymptom(opt.id)}
            >
              {opt.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
};
