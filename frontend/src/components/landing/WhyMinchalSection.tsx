import React from 'react';
import { FileText, Tv } from 'lucide-react';

export const WhyMinchalSection: React.FC = () => {
  return (
    <section id="why-minchal" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-mono">
            Zero Barriers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            You don’t need a smart home to understand your energy.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Start with what you already have — your monthly electricity bill and basic household appliance details.
          </p>
        </div>

        {/* 3 NOs vs 1 JUST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* LEFT: What is NOT required */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              No Additional Hardware Needed
            </h3>

            <div className="space-y-3 text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-rose-500 font-extrabold font-mono text-base">✕</span>
                <span>NO SMART METER REQUIRED</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-rose-500 font-extrabold font-mono text-base">✕</span>
                <span>NO EXTRA SENSORS OR MONITORS</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-rose-500 font-extrabold font-mono text-base">✕</span>
                <span>NO ELECTRICIAN INSTALLATION</span>
              </div>
            </div>
          </div>

          {/* RIGHT: What IS required */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-brand-900 text-white border border-brand-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase tracking-wider block">
                Just Start With
              </span>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-950/80 border border-brand-800 text-sm font-bold text-white">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>Your electricity bill</span>
                </div>

                <div className="text-center font-mono text-xs text-brand-400">+</div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-950/80 border border-brand-800 text-sm font-bold text-white">
                  <Tv className="w-4 h-4 text-brand-400" />
                  <span>Your appliance information</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-800 text-center font-bold text-emerald-400 text-sm">
              Start with what you already have.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
