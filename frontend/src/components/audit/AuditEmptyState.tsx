import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AuditEmptyState: React.FC = () => {
  const navigate = useNavigate();

  const handleStartAudit = () => {
    navigate('/audit/bill');
  };

  return (
    <Card variant="default" className="p-8 text-center space-y-6 max-w-lg mx-auto shadow-soft-lg bg-white border-slate-200">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert className="w-8 h-8 text-brand-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-h2 text-slate-900">No Active Audit Result</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Your audit session has expired or is incomplete. Please upload your bill and configure appliances to view your audit.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleStartAudit}
        leftIcon={<FileText className="w-5 h-5" />}
        fullWidth
        className="text-sm font-bold shadow-md"
      >
        Start New Household Audit
      </Button>
    </Card>
  );
};
