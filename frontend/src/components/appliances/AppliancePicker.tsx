import React from 'react';
import { APPLIANCE_CATALOG } from '../../config/appliances';
import { ApplianceInput, ApplianceType } from '../../types/api';
import { ApplianceCard } from './ApplianceCard';

export interface AppliancePickerProps {
  selectedAppliances: ApplianceInput[];
  onToggleType: (type: ApplianceType) => void;
  onConfigureInstance: (instance: ApplianceInput) => void;
}

export const AppliancePicker: React.FC<AppliancePickerProps> = ({
  selectedAppliances,
  onToggleType,
  onConfigureInstance,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 text-slate-900">Appliance Catalog</h2>
        <span className="text-xs font-semibold text-slate-500">
          {selectedAppliances.length} of 8 selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPLIANCE_CATALOG.map((item) => {
          const instance = selectedAppliances.find((app) => app.type === item.type);
          const isSelected = !!instance;

          return (
            <ApplianceCard
              key={item.type}
              catalogItem={item}
              instance={instance}
              isSelected={isSelected}
              onToggle={() => onToggleType(item.type)}
              onConfigure={instance ? () => onConfigureInstance(instance) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};
