import React, { useState } from 'react';
import { Keyboard, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { submitManualBill } from '../../api/manualBillApi';
import { ExtractBillResponse } from '../../types/api';

export interface ManualBillEntryProps {
  onSuccess: (bill: ExtractBillResponse) => void;
  onCancel: () => void;
}

type Fields = {
  units_consumed: string;
  total_amount: string;
  billing_days: string;
  tariff_slab: string;
};

const EMPTY: Fields = {
  units_consumed: '',
  total_amount: '',
  billing_days: '',
  tariff_slab: 'LT-1A',
};

/**
 * Break-glass fallback: type the four numbers straight off the paper bill when
 * OCR cannot read it. Intentionally plain — this only has to work.
 *
 * The backend applies the same validation gate as extraction, so its rejection
 * message is shown verbatim rather than being second-guessed here.
 */
export const ManualBillEntry: React.FC<ManualBillEntryProps> = ({ onSuccess, onCancel }) => {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setError(null);
  };

  const missing =
    !fields.units_consumed || !fields.total_amount || !fields.billing_days || !fields.tariff_slab;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missing || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const bill = await submitManualBill({
        units_consumed: Number(fields.units_consumed),
        total_amount: Number(fields.total_amount),
        billing_days: Number(fields.billing_days),
        tariff_slab: fields.tariff_slab.trim(),
      });
      onSuccess(bill);
    } catch (err: any) {
      // Backend copy is written for typing, not photographing — show it as-is.
      setError(err?.message || 'Could not accept those values. Check them against the bill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
          <Keyboard className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg">Enter the bill manually</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Copy these four values straight off your printed bill. The analysis is
            identical — only the reading step is skipped.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Units consumed (kWh)"
          type="number"
          inputMode="decimal"
          min="1"
          step="any"
          placeholder="e.g. 620"
          value={fields.units_consumed}
          onChange={set('units_consumed')}
        />
        <Input
          label="Total amount (Rs)"
          type="number"
          inputMode="decimal"
          min="1"
          step="any"
          placeholder="e.g. 4800"
          value={fields.total_amount}
          onChange={set('total_amount')}
        />
        <Input
          label="Billing days"
          type="number"
          inputMode="numeric"
          min="15"
          max="95"
          placeholder="e.g. 61 (TNEB bills are usually bi-monthly)"
          value={fields.billing_days}
          onChange={set('billing_days')}
        />
        <Input
          label="Tariff slab"
          type="text"
          placeholder="e.g. LT-1A"
          value={fields.tariff_slab}
          onChange={set('tariff_slab')}
          hint="Printed near the top of the bill. Leave as LT-1A if unsure."
        />

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            className="sm:flex-1"
          >
            Back to photo
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={missing || submitting}
            className="sm:flex-1 font-bold"
          >
            {submitting ? 'Checking…' : 'Use these values'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
