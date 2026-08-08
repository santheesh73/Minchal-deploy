import React from 'react';
import { Calculator, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card } from '../ui/Card';

export const ExplainabilitySection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Transparent Derivations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Every Important Number Has a Reason
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            No black-box calculations or arbitrary figures. Tap any appliance estimate to view its full derivation.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card variant="default" className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-soft-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kitchen Refrigerator Estimate Derivation</h3>
                <span className="text-xs text-slate-500">250L Single Door • Rank #2 Contributor</span>
              </div>
              <span className="font-mono font-extrabold text-brand-600 text-lg">₹568 / mo</span>
            </div>

            {/* Math Steps List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-600" />
                What MINCHAL Did (Math Derivation)
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">1. Compressor Rated Power</span>
                  <span className="font-mono font-bold text-slate-900">140 W</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">2. Estimated Duty Cycle</span>
                  <span className="font-mono font-bold text-slate-900">45% (~10.8 hrs/day)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">3. Monthly Baseline Energy</span>
                  <span className="font-mono font-bold text-slate-900">45.3 kWh</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">4. Bill Tariff Normalization Factor</span>
                  <span className="font-mono font-bold text-slate-900">1.04×</span>
                </div>
              </div>
            </div>

            {/* Assumptions List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                What MINCHAL Had To Assume
              </span>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Assumed standard ambient room temperature of ~30°C.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Door opening frequency estimated at average household rate (~15 times/day).</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
