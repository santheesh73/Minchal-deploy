import React from 'react';
import { FileText, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { formatEstimateRupees, formatUnits, formatDate } from '../../utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const BillSummaryBar: React.FC = () => {
  const { state } = useAudit();
  const bill = state.billData;

  if (!bill) {
    return (
      <Card variant="flat" className="p-4 border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>No bill confirmed yet. Audit calculations will use standard tariff defaults.</span>
        </div>
        <Badge variant="warning" size="sm">Mock Bill</Badge>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Confirmed Bill Details</span>
            <span className="text-brand-200 text-[11px]">{bill.tariff_slab} • {formatDate(bill.period_end)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-brand-100 font-medium">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-emerald-300" />
            <strong className="text-white font-mono">{formatEstimateRupees(bill.total_amount)}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            <strong className="text-white font-mono">{formatUnits(bill.units_consumed)}</strong> ({bill.billing_days}d)
          </span>
          <span className="hidden md:flex items-center gap-1 text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirmed
          </span>
        </div>
      </div>
    </Card>
  );
};
