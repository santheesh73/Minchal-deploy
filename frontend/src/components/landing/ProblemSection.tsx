import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            The Household Energy Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your electricity bill tells you <span className="text-rose-600">WHAT</span> you used.
            <br className="hidden sm:inline" /> It doesn't tell you <span className="text-emerald-600">WHERE</span> the money went.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Most Indian households receive a single total monthly electricity bill, leaving them blind to which appliances drive consumption, which are inefficient, or where savings opportunities exist.
          </p>
        </div>

        {/* Before vs After Comparison Grid using MagicBento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {/* BEFORE MINCHAL MagicBento Card */}
          <MagicBento glowColor="amber" className="p-6 sm:p-8 space-y-5 border-rose-200 bg-rose-50/20">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <HelpCircle className="w-5 h-5" />
                <span>BEFORE MINCHAL</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                Opaque Total Bill
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-1 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Monthly Amount</span>
                <p className="text-3xl font-extrabold text-slate-900 font-mono">₹ 2,843</p>
                <span className="text-xs text-rose-600 font-medium block">"Why is my bill so high this month?"</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2 text-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>No breakdown of individual appliance monthly cost</span>
                </div>
                <div className="flex items-start gap-2 text-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>No visibility into star-rating efficiency gaps</span>
                </div>
                <div className="flex items-start gap-2 text-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>No prioritized actionable habit or upgrade steps</span>
                </div>
              </div>
            </div>
          </MagicBento>

          {/* AFTER MINCHAL MagicBento Card */}
          <MagicBento glowColor="emerald" className="p-6 sm:p-8 space-y-5 border-emerald-300 bg-emerald-50/20">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>AFTER MINCHAL</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Explainable Audit
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 space-y-2 shadow-xs">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>Appliance Cost Attribution</span>
                  <span className="text-emerald-700 font-mono">100% Normalized</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Bedroom AC (1.5T 3★)</span>
                    <span className="font-mono font-bold text-slate-900">₹1,137 (40%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[40%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-700">Kitchen Refrigerator</span>
                    <span className="font-mono font-bold text-slate-900">₹568 (20%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full w-[20%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-700">Geyser & Washing Machine</span>
                    <span className="font-mono font-bold text-slate-900">₹710 (25%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full w-[25%]" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                <span>Identified Savings Potential:</span>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">~₹1,246 / mo</span>
              </div>
            </div>
          </MagicBento>
        </div>
      </div>
    </section>
  );
};
