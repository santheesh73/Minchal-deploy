import React from 'react';
import { AlertTriangle, Camera, RotateCcw, HelpCircle, WifiOff } from 'lucide-react';
import { ApiError } from '../../types/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface BillExtractionErrorProps {
  error: ApiError;
  onRetry: () => void;
  /** Break-glass path when the photo will never read: type the numbers in. */
  onManualEntry?: () => void;
}

/**
 * Every failure branch offers manual entry. Whatever went wrong with the
 * photo, the user still has the bill in their hand — so there must always be a
 * way forward that does not depend on the camera.
 */
const ManualEntryEscape: React.FC<{ onManualEntry?: () => void }> = ({ onManualEntry }) =>
  onManualEntry ? (
    <p className="text-xs text-slate-500 pt-1">
      Photo not working?{' '}
      <button
        type="button"
        onClick={onManualEntry}
        className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
      >
        Enter the numbers manually
      </button>
    </p>
  ) : null;

export const BillExtractionError: React.FC<BillExtractionErrorProps> = ({
  error,
  onRetry,
  onManualEntry,
}) => {
  const { reason, message } = error;

  switch (reason) {
    case 'OCR_BLUR':
      return (
        <Card variant="default" className="p-8 text-center space-y-6 border-amber-200 bg-amber-50/40">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Camera className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">
              Couldn't read the bill clearly
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {message || 'The uploaded photo was too blurry or dim to extract numbers cleanly.'}
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left bg-white p-4 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900">Tips for a clear scan:</p>
            <ul className="space-y-1 text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">✓</span> Good lighting on the bill
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">✓</span> Ensure full bill is visible
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">✓</span> Avoid camera reflections or glare
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="px-8 font-bold"
            >
              Retake Photo
            </Button>
            <ManualEntryEscape onManualEntry={onManualEntry} />
          </div>
        </Card>
      );

    case 'OCR_MISSING_FIELD':
      return (
        <Card variant="default" className="p-8 text-center space-y-6 border-amber-200 bg-amber-50/40">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">
              Key Bill Fields Missing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {message || 'Units consumed or total bill amount could not be detected. Please ensure the full statement is visible.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="px-8 font-bold"
            >
              Scan Again
            </Button>
            <ManualEntryEscape onManualEntry={onManualEntry} />
          </div>
        </Card>
      );

    case 'INVALID_BILL':
      return (
        <Card variant="default" className="p-8 text-center space-y-6 border-red-200 bg-red-50/40">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">
              Not a Valid Electricity Bill
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {message || 'This document does not appear to be an official electricity bill statement. Please upload a clear TNEB / EB bill.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="px-8 font-bold"
            >
              Try Again
            </Button>
            <ManualEntryEscape onManualEntry={onManualEntry} />
          </div>
        </Card>
      );

    case 'SERVER_ERROR':
    default:
      return (
        <Card variant="default" className="p-8 text-center space-y-6 border-slate-200 bg-white">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-sm">
            <WifiOff className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">
              Unable to Process Bill Right Now
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {message || 'An issue occurred while processing your bill image. Please check your connection and try again.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="px-8 font-semibold"
            >
              Try Again
            </Button>
            <ManualEntryEscape onManualEntry={onManualEntry} />
          </div>
        </Card>
      );
  }
};
