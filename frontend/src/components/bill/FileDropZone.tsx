import React, { useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/60 shadow-glow'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50/50 shadow-soft'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="Upload electricity bill image or PDF"
      />

      <div className="space-y-4 pointer-events-none">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Upload your Electricity Bill
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Drag and drop your bill photo here, or click to browse files from your device.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-brand-600" />
          <span>JPG, PNG, WEBP, PDF up to 20MB</span>
        </div>
      </div>
    </div>
  );
};
