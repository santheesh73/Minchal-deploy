import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, Check, X } from 'lucide-react';
import { NameplateData, ApplianceType } from '../../types/api';
import { getApplianceCatalogItem } from '../../config/appliances';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface NameplateResultProps {
  data: NameplateData;
  currentApplianceType: ApplianceType;
  onApply: (data: NameplateData) => void;
  onDismiss: () => void;
}

export const NameplateResult: React.FC<NameplateResultProps> = ({
  data,
  currentApplianceType,
  onApply,
  onDismiss,
}) => {
  const isTypeMismatch = data.appliance_type && data.appliance_type !== currentApplianceType;
  const currentCatalog = getApplianceCatalogItem(currentApplianceType);
  const scannedCatalog = data.appliance_type ? getApplianceCatalogItem(data.appliance_type) : null;

  return (
    <Card variant="default" className="p-5 space-y-4 border-brand-200 bg-brand-50/30">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Extracted Nameplate Details</h4>
            <p className="text-[11px] text-slate-500">Gemini Vision rating plate OCR</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          OCR Complete
        </span>
      </div>

      {/* TYPE MISMATCH WARNING */}
      {isTypeMismatch && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Appliance Type Mismatch Warning</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            The scanned rating plate appears to belong to a <strong>{scannedCatalog?.label || data.appliance_type}</strong>, but you are currently configuring a <strong>{currentCatalog?.label}</strong>. Please review values before applying.
          </p>
        </div>
      )}

      {/* Extracted Fields Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Capacity</span>
          <p className="font-bold text-slate-900 font-mono">
            {data.capacity !== null ? `${data.capacity} ${currentCatalog?.capacityUnit || ''}` : 'Not detected'}
          </p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Star Rating</span>
          <p className="font-bold text-amber-600 font-mono">
            {data.star_rating !== null ? `${data.star_rating}★` : 'Not detected'}
          </p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Mfg Year</span>
          <p className="font-bold text-slate-900 font-mono">
            {data.manufacture_year !== null ? data.manufacture_year : 'Not detected'}
          </p>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Power Rating</span>
          <p className="font-bold text-brand-600 font-mono">
            {data.rated_power_w !== null ? `${data.rated_power_w} W` : 'Not detected'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="success"
          size="sm"
          onClick={() => onApply(data)}
          leftIcon={<Check className="w-4 h-4" />}
          fullWidth
          className="font-bold text-xs"
        >
          Apply Extracted Values
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          leftIcon={<X className="w-4 h-4" />}
          className="text-xs text-slate-500"
        >
          Dismiss
        </Button>
      </div>
    </Card>
  );
};
