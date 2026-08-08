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
  Check,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ApplianceCatalogItem } from '../../config/appliances';
import { ApplianceInput } from '../../types/api';
import { Card } from '../ui/Card';

export interface ApplianceCardProps {
  catalogItem: ApplianceCatalogItem;
  instance?: ApplianceInput;
  isSelected: boolean;
  onToggle: () => void;
  onConfigure?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Snowflake,
  Refrigerator,
  Flame,
  Shirt,
  Fan,
  Tv,
  Lightbulb,
  Gauge,
};

export const ApplianceCard: React.FC<ApplianceCardProps> = ({
  catalogItem,
  instance,
  isSelected,
  onToggle,
  onConfigure,
}) => {
  const IconComponent = ICON_MAP[catalogItem.iconName] || Flame;

  // Check if appliance configuration has all details completed
  // For fridge, runtime (hours_band) is not required (it is null)
  const isConfigured =
    isSelected &&
    instance &&
    (catalogItem.supportsStar ? instance.star > 0 : true) &&
    (catalogItem.supportsYear ? instance.year > 0 : true) &&
    (catalogItem.type === 'fridge' ? true : instance.hours_band !== null);

  return (
    <Card
      variant={isSelected ? 'interactive' : 'default'}
      onClick={onToggle}
      className={`p-4 relative space-y-3 transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20 shadow-soft-lg'
          : 'hover:border-slate-300 hover:bg-slate-50/60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Selection Badge */}
        <div
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
            isSelected
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              Added
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-sm">{catalogItem.label}</h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
          {catalogItem.description}
        </p>
      </div>

      {/* Configuration Status Badge if Selected */}
      {isSelected && (
        <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold flex items-center gap-1 ${
              isConfigured ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Configured
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Needs details
              </>
            )}
          </span>

          {onConfigure && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 underline focus:outline-none"
            >
              Configure
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
