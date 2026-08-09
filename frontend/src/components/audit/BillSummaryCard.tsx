import React from 'react';
import { FileText, Calendar, Tag, Layers } from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { formatEstimateRupees, formatUnits, formatDate } from '../../utils';
import { Card } from '../ui/Card';
import { DataTrustLabel } from '../explainability/DataTrustLabel';
import { getTranslation } from '../../utils/translations';

export interface BillSummaryCardProps {
  billTotalRupees: number;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({ billTotalRupees }) => {
  const { state } = useAudit();
  const bill = state.billData;
  const t = getTranslation(state.language);

  const totalRupees = bill?.total_amount || billTotalRupees;

  return (
    <Card variant="default" className="p-5 space-y-4 bg-white border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-sm">{t.extractedBillSummary}</h3>
              <DataTrustLabel category="extracted" />
            </div>
            <p className="text-[11px] text-slate-500">{state.language === 'ta' ? 'அதிகாரப்பூர்வ மின் கட்டணப் பதிவு' : 'Official DISCOM billing record'}</p>
          </div>
        </div>

        {bill?.tariff_slab && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {bill.tariff_slab}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-600" />
            {state.language === 'ta' ? 'மொத்த கட்டணம்' : 'Total Billed'}
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {formatEstimateRupees(totalRupees)}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-brand-600" />
            {state.language === 'ta' ? 'மின் நுகர்வு' : 'Consumption'}
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {bill?.units_consumed ? formatUnits(bill.units_consumed) : '—'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            {state.language === 'ta' ? 'கட்டணக் சுழற்சி' : 'Billing Cycle'}
          </span>
          <p className="text-xs font-bold text-slate-900">
            {bill?.billing_days ? `${bill.billing_days} ${state.language === 'ta' ? 'நாட்கள்' : 'Days'}` : (state.language === 'ta' ? 'சாதாரண சுழற்சி' : 'Standard Cycle')}
            {bill?.period_end && <span className="text-[10px] text-slate-500 font-normal block">{formatDate(bill.period_end)}</span>}
          </p>
        </div>
      </div>

      {/* Charge Items Table Breakdown */}
      {bill && (bill.energy_charges !== null || bill.fixed_charges !== null) && (
        <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{state.language === 'ta' ? 'கட்டண விவரங்களின் பட்டியல்' : 'Charge Breakdown'}</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
            {bill.energy_charges !== null && (
              <div className="flex justify-between">
                <span>{state.language === 'ta' ? 'மின்சாரக் கட்டணம்:' : 'Energy Charges:'}</span>
                <span className="font-mono font-semibold text-slate-900">{formatEstimateRupees(bill.energy_charges)}</span>
              </div>
            )}
            {bill.fixed_charges !== null && (
              <div className="flex justify-between">
                <span>{state.language === 'ta' ? 'நிலையானக் கட்டணம்:' : 'Fixed / Demand:'}</span>
                <span className="font-mono font-semibold text-slate-900">{formatEstimateRupees(bill.fixed_charges)}</span>
              </div>
            )}
            {bill.taxes_and_duties !== null && (
              <div className="flex justify-between">
                <span>{state.language === 'ta' ? 'வரிகள் & வரிகள்:' : 'Taxes & Duties:'}</span>
                <span className="font-mono font-semibold text-slate-900">{formatEstimateRupees(bill.taxes_and_duties)}</span>
              </div>
            )}
            {bill.subsidy_applied !== null && bill.subsidy_applied > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{state.language === 'ta' ? 'அரசு மானியம்:' : 'Govt Subsidy:'}</span>
                <span className="font-mono font-bold">-{formatEstimateRupees(bill.subsidy_applied)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
