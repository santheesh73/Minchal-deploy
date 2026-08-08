import React from 'react';
import { Settings, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApplianceInput } from '../../types/api';
import { getApplianceCatalogItem } from '../../config/appliances';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SelectedApplianceListProps {
  appliances: ApplianceInput[];
  onConfigure: (appliance: ApplianceInput) => void;
  onRemove: (id: string) => void;
}

export const SelectedApplianceList: React.FC<SelectedApplianceListProps> = ({
  appliances,
  onConfigure,
  onRemove,
}) => {
  if (appliances.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-base">Selected Appliances Summary</h3>
        <span className="text-xs text-brand-600 font-semibold">{appliances.length} items to audit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {appliances.map((app) => {
          const catalog = getApplianceCatalogItem(app.type);
          const isConfigured =
            (catalog?.supportsStar ? app.star > 0 : true) &&
            (catalog?.supportsYear ? app.year > 0 : true) &&
            (app.type === 'fridge' ? true : app.hours_band !== null);

          return (
            <Card key={app.id} variant="default" className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{catalog?.label}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isConfigured
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isConfigured ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Needs details
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  {catalog?.supportsCapacity && app.capacity && (
                    <span>
                      {app.capacity} {catalog.capacityUnit}
                    </span>
                  )}
                  {catalog?.supportsStar && <span>• {app.star}★</span>}
                  {catalog?.supportsYear && <span>• {app.year}</span>}
                  <span>
                    • {app.type === 'fridge' ? 'Always on' : app.hours_band ? `${app.hours_band} hrs/day` : 'Runtime missing'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(app)}
                  leftIcon={<Settings className="w-3.5 h-3.5 text-brand-600" />}
                  className="text-xs"
                >
                  Configure
                </Button>
                <button
                  type="button"
                  onClick={() => onRemove(app.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove appliance"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
