import React from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const ExplainabilitySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold font-mono uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-brand-600" />
              <span>Math Derivations</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Every number should have a reason.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              We don’t just show you a number. We show you how we got there.
            </p>

            <div className="space-y-3 text-sm text-slate-700 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deterministic math formulas based on actual DISCOM tariff slabs.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Transparent appliance power ratings and usage hours.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Full step-by-step breakdown visible for every calculation.</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Derivation Card */}
          <div className="lg:col-span-6">
            <MagicBento glowColor="brand" className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Derivation Example</span>
                <span className="text-xs font-mono text-brand-400 bg-brand-950 border border-brand-800 px-2.5 py-0.5 rounded">
                  Air Conditioner
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Estimated Monthly Energy</span>
                  <span className="text-2xl font-bold text-white">280.8 kWh</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-slate-300">
                  <div className="text-[10px] text-brand-400 uppercase font-bold tracking-wider">Calculation Formula</div>
                  <div className="text-sm font-bold text-white">
                    Capacity × Runtime × Days × Efficiency factor
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    (1.5 kW) × (6 hrs/day) × (30 days) × (1.56 degradation factor)
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Estimated Tariff Cost:</span>
                  <span className="text-xl font-bold text-emerald-400">₹2,260</span>
                </div>
              </div>
            </MagicBento>
          </div>

        </div>
      </div>
    </section>
  );
};
