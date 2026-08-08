import React from 'react';
import { CheckCircle2, ArrowRight, RotateCcw, FileText, Calendar, Tag, Clock } from 'lucide-react';
import { ExtractBillResponse } from '../../types/api';
import { formatEstimateRupees, formatUnits, formatDate } from '../../utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BillChargeBreakdown } from './BillChargeBreakdown';

export interface ExtractedBillDetailsProps {
  bill: ExtractBillResponse;
  onConfirm: () => void;
  onScanAgain: () => void;
  /**
   * Where these numbers came from. Manually entered values must NOT be
   * labelled as OCR output — claiming Gemini read a bill the user typed is a
   * false provenance claim, and provenance is the whole point of this product.
   */
  source?: 'ocr' | 'manual';
}

export const ExtractedBillDetails: React.FC<ExtractedBillDetailsProps> = ({
  bill,
  onConfirm,
  onScanAgain, source = 'ocr',
}) => {
  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <Card variant="default" className="p-6 space-y-6 border-emerald-200 bg-emerald-50/40">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {source === 'manual' ? 'Bill Details Entered' : 'Bill Read Successfully'}
              </h3>
              <p className="text-xs text-slate-500">
                {source === 'manual'
                  ? 'Entered manually — checked against the same validation rules'
                  : 'Gemini Vision OCR extraction complete'}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {source === 'manual' ? 'Manual entry' : 'Verified'}
          </Badge>
        </div>

        {/* Primary Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <FileText className="w-3 h-3 text-brand-600" />
              Units Consumed
            </span>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {formatUnits(bill.units_consumed)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-600" />
              Total Bill Amount
            </span>
            <p className="text-lg font-bold text-emerald-700 font-mono">
              {formatEstimateRupees(bill.total_amount)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Billing Days
            </span>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {bill.billing_days} days
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-600" />
              Tariff / Period
            </span>
            <p className="text-sm font-bold text-slate-900 truncate" title={bill.tariff_slab}>
              {bill.tariff_slab}
            </p>
            <p className="text-[10px] text-slate-500">{formatDate(bill.period_end)}</p>
          </div>
        </div>

        {/* Optional Charge Breakdown */}
        <BillChargeBreakdown bill={bill} />
      </Card>

      {/* Confirmation Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onScanAgain}
          leftIcon={<RotateCcw className="w-5 h-5 text-slate-600" />}
          fullWidth
          className="text-base font-semibold"
        >
          Scan Again
        </Button>

        <Button
          variant="success"
          size="lg"
          onClick={onConfirm}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          fullWidth
          className="text-base font-bold shadow-md hover:shadow-lg"
        >
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
};
