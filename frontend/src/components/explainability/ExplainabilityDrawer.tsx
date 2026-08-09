import React, { useEffect } from 'react';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import { ExplainabilityContext } from '../../utils/explainabilityMapper';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WorkingList } from './WorkingList';
import { AssumptionsList } from './AssumptionsList';
import { ConfidenceReasons } from './ConfidenceReasons';
import { useAudit } from '../../store/AuditContext';

export interface ExplainabilityDrawerProps {
  context: ExplainabilityContext | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  context,
  isOpen,
  onClose,
}) => {
  const { state } = useAudit();
  const isTa = state.language === 'ta';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!context || !isOpen) {
    return null;
  }

  const modalTitle = isTa
    ? `கணக்கீட்டு விவரங்கள் — ${context.title}`
    : `How Was This Estimated? — ${context.title}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto font-semibold">
          {isTa ? 'விளக்கத்தை மூடு' : 'Close Explanation'}
        </Button>
      }
    >
      <div className="space-y-4">
        {context.subtitle && (
          <p className="text-xs text-slate-500 font-medium -mt-2">
            {context.subtitle}
          </p>
        )}

        {/* Confidence Header if available */}
        {context.confidencePercent !== undefined && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-900">{isTa ? 'தணிக்கை நம்பகத்தன்மை அளவு' : 'Audit Confidence Score'}</span>
            </div>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {context.confidencePercent}%
            </span>
          </div>
        )}

        {/* Working Math Steps ("What MINCHAL Did") */}
        <WorkingList working={context.working} />

        {/* Assumptions List ("What MINCHAL Had To Assume") */}
        <AssumptionsList assumptions={context.assumptions} />

        {/* Confidence Reasons if overall */}
        {context.confidenceReasons && context.confidenceReasons.length > 0 && (
          <ConfidenceReasons reasons={context.confidenceReasons} />
        )}

        {/* Audit Transparency Guarantee Note */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{isTa ? 'மின்சல் கணக்கீடுகள் முழுவதும் துல்லியமானவை மற்றும் உங்கள் தரவுகளின் அடிப்படையில் இயங்குபவை.' : 'MINCHAL calculations are fully deterministic and reproducible based on your inputs.'}</span>
        </div>
      </div>
    </Modal>
  );
};
