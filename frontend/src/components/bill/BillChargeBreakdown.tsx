import React from 'react';
import { BillData } from '../../types/api';
import { formatEstimateRupees, formatCurrency } from '../../utils/currency';
import { Card } from '../ui/Card';

export interface BillChargeBreakdownProps {
  bill: BillData;
}

export const BillChargeBreakdown: React.FC<BillChargeBreakdownProps> = ({ bill }) => {
  const charges = [
    { label: 'Energy Charges', value: bill.energy_charges },
    { label: 'Fixed Charges', value: bill.fixed_charges },
    { label: 'Taxes & Duties', value: bill.taxes_and_duties },
    { label: 'Subsidy Applied', value: bill.subsidy_applied },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (charges.length === 0) {
    return null;
  }

  return (
    <Card variant="flat" className="p-5 space-y-3">
      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
        Extracted Bill Charges
      </h4>
      <div className="divide-y divide-slate-200/70 text-sm">
        {charges.map((charge) => (
          <div key={charge.label} className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">{charge.label}</span>
            <span className="font-bold text-slate-900">
              {charge.label === 'Subsidy Applied' && charge.value! > 0
                ? `- ${formatCurrency(charge.value)}`
                : formatEstimateRupees(charge.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
