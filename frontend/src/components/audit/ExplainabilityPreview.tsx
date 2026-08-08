import React from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { BreakdownItem } from '../../types/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface ExplainabilityPreviewProps {
  item: BreakdownItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityPreview: React.FC<ExplainabilityPreviewProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!item) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Calculation Steps — ${item.label || item.type}`}
      footer={
        <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
          Close Calculation Details
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Deterministic math formulas and engine calculations per appliance category.</span>
        </div>

        {/* Working Steps */}
        {item.working && item.working.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Working Steps</h4>
            <div className="space-y-1.5">
              {item.working.map((w, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{w.label}</span>
                  <span className="font-bold font-mono text-slate-900">{w.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Underlying Assumptions */}
        {item.assumptions && item.assumptions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Model Assumptions</h4>
            <ul className="space-y-1.5 text-slate-600">
              {item.assumptions.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};
