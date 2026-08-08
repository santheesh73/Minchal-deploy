import React from 'react';
import { Sparkles, FileText, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export interface ExtractionLoadingProps {
  status: 'compressing' | 'extracting';
}

export const ExtractionLoading: React.FC<ExtractionLoadingProps> = ({ status }) => {
  const isCompressing = status === 'compressing';

  return (
    <Card variant="default" className="p-8 sm:p-12 text-center space-y-6 shadow-soft-lg">
      {/* Animated Icon & Scanning Visual */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-brand-500/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg">
          <FileText className="w-10 h-10" />
        </div>
      </div>

      {/* Loading Title & Message */}
      <div className="space-y-2" role="status" aria-live="polite">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Vision Perception</span>
        </div>
        <h2 className="text-h2 text-slate-900">Reading your electricity bill...</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isCompressing
            ? 'Optimizing bill image dimensions and quality...'
            : 'Extracting units consumed, total amount, billing days, and tariff slab...'}
        </p>
      </div>

      {/* Progress Bar & Status */}
      <div className="max-w-xs mx-auto space-y-2">
        <ProgressBar
          value={isCompressing ? 35 : 80}
          color="primary"
          height="md"
        />
        <p className="text-xs font-medium text-slate-400">
          {isCompressing ? 'Step 1/2: Client Compression (1600px max)' : 'Step 2/2: POST /api/extract-bill'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Personal consumer info is never extracted</span>
      </div>
    </Card>
  );
};
