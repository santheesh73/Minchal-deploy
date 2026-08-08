import React from 'react';
import { RotateCcw, Zap, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onRetake: () => void;
  onExtract: () => void;
  isProcessing?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  previewUrl,
  onRetake,
  onExtract,
  isProcessing = false,
}) => {
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

  return (
    <Card variant="default" className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-base">Selected Electricity Bill</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono truncate max-w-[160px] sm:max-w-xs">
          {file.name}
        </span>
      </div>

      {/* Preview Area */}
      <div className="relative rounded-2xl bg-slate-900/90 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[50vh] p-2">
        {isPdf ? (
          <div className="py-12 text-center text-white space-y-3">
            <FileText className="w-16 h-16 text-brand-400 mx-auto" />
            <p className="font-semibold text-sm">PDF Document Loaded</p>
            <p className="text-xs text-slate-400">{file.name}</p>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Electricity bill preview"
            className="w-auto h-full max-h-[45vh] object-contain rounded-xl shadow-lg"
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onRetake}
          disabled={isProcessing}
          leftIcon={<RotateCcw className="w-5 h-5 text-slate-600" />}
          fullWidth
          className="text-base font-semibold"
        >
          Retake / Change
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onExtract}
          loading={isProcessing}
          disabled={isProcessing}
          leftIcon={<Zap className="w-5 h-5 fill-current" />}
          fullWidth
          className="text-base font-bold shadow-md hover:shadow-lg"
        >
          Extract Bill
        </Button>
      </div>
    </Card>
  );
};
