import React from 'react';
import { ShieldCheck, EyeOff, Calculator } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest font-mono">
            Privacy & Trust
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your bill is yours.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            MINCHAL is designed to protect household privacy. We process electricity numbers without storing personal identity data.
          </p>
        </div>

        {/* Trust Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <MagicBento glowColor="emerald" className="p-6 space-y-3 bg-white border border-slate-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Privacy First</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Consumer name, service number, and address are excluded from data extraction and database storage.
            </p>
          </MagicBento>

          <MagicBento glowColor="brand" className="p-6 space-y-3 bg-white border border-slate-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Explainable Calculations</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Calculations use deterministic physics formulas and official DISCOM tariff structures.
            </p>
          </MagicBento>

          <MagicBento glowColor="amber" className="p-6 space-y-3 bg-white border border-slate-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clear Assumptions</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Every audit lists exact wattage, runtime hours, and efficiency factors used in derivations.
            </p>
          </MagicBento>
        </div>

      </div>
    </section>
  );
};
