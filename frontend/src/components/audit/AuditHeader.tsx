import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { Button } from '../ui/Button';

export interface AuditHeaderProps {
  explanation?: string;
  isStale?: boolean;
  onReanalyze?: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({
  explanation,
  isStale,
  onReanalyze,
}) => {
  const navigate = useNavigate();
  const { dispatch } = useAudit();

  const handleRestart = () => {
    dispatch({ type: 'RESET_AUDIT' });
    navigate('/audit/bill');
  };

  return (
    <div className="space-y-3 border-b border-slate-200/80 pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>MINCHAL Household Energy Audit</span>
          </div>
          <h1 className="text-h1 text-slate-900">Your Energy Audit Dashboard</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-600" />}
          className="shrink-0 font-semibold text-xs border-slate-300"
        >
          New Energy Audit
        </Button>
      </div>

      {/* Stale Audit Warning Banner */}
      {isStale && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Audit Inputs Changed:</strong> This energy audit is based on earlier bill or appliance inputs.
            </span>
          </div>
          {onReanalyze && (
            <Button
              variant="primary"
              size="sm"
              onClick={onReanalyze}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="shrink-0 font-bold text-xs shadow-sm"
            >
              Re-analyze Energy Audit
            </Button>
          )}
        </div>
      )}

      {explanation && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 via-blue-50/50 to-purple-50/30 border border-brand-200/70 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="italic font-medium leading-relaxed">"{explanation}"</p>
        </div>
      )}
    </div>
  );
};
