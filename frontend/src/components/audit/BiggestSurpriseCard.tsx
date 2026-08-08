import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Insights } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';

export interface BiggestSurpriseCardProps {
  insights: Insights;
}

export const BiggestSurpriseCard: React.FC<BiggestSurpriseCardProps> = ({ insights }) => {
  const surprise = insights?.biggest_surprise;

  if (!surprise) {
    return null;
  }

  return (
    <Card variant="default" className="p-5 space-y-3 bg-purple-50/40 border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Biggest Energy Surprise</h3>
            <p className="text-[11px] text-slate-500">Unexpected load finding</p>
          </div>
        </div>

        {surprise.rupees > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 font-mono">
            ~{formatEstimateRupees(surprise.rupees)} / mo
          </span>
        )}
      </div>

      <div className="p-3.5 bg-white rounded-xl border border-purple-200/80 space-y-1">
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
          {surprise.label || surprise.type}
        </span>
        <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
          "{surprise.line}"
        </p>
      </div>
    </Card>
  );
};
