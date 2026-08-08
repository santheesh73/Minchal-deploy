import React from 'react';
import { FileText, Calculator, TrendingDown } from 'lucide-react';

export type TrustCategory = 'extracted' | 'estimated' | 'potential';

export interface DataTrustLabelProps {
  category: TrustCategory;
  customText?: string;
  className?: string;
}

export const DataTrustLabel: React.FC<DataTrustLabelProps> = ({
  category,
  customText,
  className = '',
}) => {
  switch (category) {
    case 'extracted':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider ${className}`}
          title="Directly extracted from confirmed bill"
        >
          <FileText className="w-3 h-3 text-blue-600" />
          {customText || 'From Bill'}
        </span>
      );

    case 'estimated':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold uppercase tracking-wider ${className}`}
          title="Calculated by deterministic energy engine"
        >
          <Calculator className="w-3 h-3 text-brand-600" />
          {customText || 'Estimated'}
        </span>
      );

    case 'potential':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider ${className}`}
          title="Potential opportunity based on audit analysis"
        >
          <TrendingDown className="w-3 h-3 text-emerald-600" />
          {customText || 'Potential'}
        </span>
      );

    default:
      return null;
  }
};
