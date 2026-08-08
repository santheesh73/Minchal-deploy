import React, { useRef, ChangeEvent } from 'react';
import { Camera, Sparkles, Upload } from 'lucide-react';
import { ApplianceType, NameplateData } from '../../types/api';
import { useNameplate } from '../../hooks/useNameplate';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { NameplateResult } from './NameplateResult';

export interface NameplateScannerProps {
  currentApplianceType: ApplianceType;
  onApplyNameplate: (data: NameplateData) => void;
}

export const NameplateScanner: React.FC<NameplateScannerProps> = ({
  currentApplianceType,
  onApplyNameplate,
}) => {
  const { status, result, error, scanNameplate, reset } = useNameplate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      scanNameplate(e.target.files[0]);
    }
  };

  const handleApply = (data: NameplateData) => {
    onApplyNameplate(data);
    reset();
  };

  const isScanning = status === 'compressing' || status === 'extracting';

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isScanning}
        className="hidden"
        aria-label="Upload nameplate rating sticker photo"
      />

      {status === 'idle' && (
        <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Auto-fill from Rating Plate Photo
            </span>
            <p className="text-slate-500">
              Scan the rating sticker on your appliance to detect star rating, capacity, and power rating.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Camera className="w-4 h-4 text-brand-600" />}
            className="shrink-0 bg-white font-semibold text-xs border-brand-300"
          >
            Scan Rating Plate
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center space-y-2">
          <Spinner size="sm" color="primary" />
          <p className="text-xs font-semibold text-brand-900">
            {status === 'compressing' ? 'Optimizing photo...' : 'Gemini Vision scanning rating plate...'}
          </p>
        </div>
      )}

      {status === 'success' && result && (
        <NameplateResult
          data={result}
          currentApplianceType={currentApplianceType}
          onApply={handleApply}
          onDismiss={reset}
        />
      )}

      {status === 'error' && error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
          <p className="font-semibold">{error.message}</p>
          <Button variant="outline" size="sm" onClick={reset} leftIcon={<Upload className="w-3.5 h-3.5" />}>
            Try Scan Again
          </Button>
        </div>
      )}
    </div>
  );
};
