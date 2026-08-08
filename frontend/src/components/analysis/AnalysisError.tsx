import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { ApiError } from '../../types/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface AnalysisErrorProps {
  error?: ApiError | null;
  validationMessage?: string | null;
  onRetry: () => void;
}

export const AnalysisError: React.FC<AnalysisErrorProps> = ({
  error,
  validationMessage,
  onRetry,
}) => {
  const navigate = useNavigate();

  const handleReviewAppliances = () => {
    navigate('/audit/appliances');
  };

  const handleReturnToBill = () => {
    navigate('/audit/bill');
  };

  const isValidationFailure = !!validationMessage;

  return (
    <Card variant="default" className="p-8 text-center space-y-6 max-w-lg mx-auto shadow-soft-lg border-amber-200 bg-white">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
        {isValidationFailure ? (
          <ShieldAlert className="w-8 h-8 text-amber-600" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-red-600" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-h2 text-slate-900">
          {isValidationFailure ? 'Audit Details Incomplete' : 'Energy Analysis Failed'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          {validationMessage ||
            error?.message ||
            'We could not complete your household energy audit right now. Please check your connection and try again.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {isValidationFailure ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReturnToBill}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              fullWidth
              className="text-sm font-semibold"
            >
              Return to Bill
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleReviewAppliances}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              fullWidth
              className="text-sm font-bold"
            >
              Review Appliances
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReviewAppliances}
              leftIcon={<ArrowLeft className="w-5 h-5 text-slate-600" />}
              fullWidth
              className="text-sm font-semibold"
            >
              Review Appliances
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              fullWidth
              className="text-sm font-bold shadow-md"
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
