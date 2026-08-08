import React from 'react';
import { Upload, ShieldCheck, Info } from 'lucide-react';
import { FileDropZone } from './FileDropZone';
import { CameraCapture } from './CameraCapture';
import { Button } from '../ui/Button';

export interface BillUploaderProps {
  onFileSelect: (file: File) => void;
  validationError?: string | null;
  disabled?: boolean;
}

export const BillUploader: React.FC<BillUploaderProps> = ({
  onFileSelect,
  validationError,
  disabled = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* File input for manual file browser */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="Upload file from device"
      />

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Primary Dropzone */}
      <FileDropZone onFileSelect={onFileSelect} disabled={disabled} />

      {/* Dual CTA Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CameraCapture onFileSelect={onFileSelect} disabled={disabled} />
        <Button
          variant="outline"
          size="lg"
          onClick={handleBrowseClick}
          disabled={disabled}
          leftIcon={<Upload className="w-5 h-5 text-slate-600" />}
          fullWidth
          className="text-base font-semibold"
        >
          Upload from Device
        </Button>
      </div>

      {/* Strict Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">Privacy Preserved</p>
          <p className="text-slate-500 leading-relaxed">
            Your electricity bill is processed strictly for unit breakdown and tariff analysis. Personal details like consumer name, consumer number, and address are never extracted or stored.
          </p>
        </div>
      </div>
    </div>
  );
};
