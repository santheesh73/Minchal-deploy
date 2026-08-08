import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Human Problem Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>The Household Dilemma</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your bill tells you how much. <br className="hidden sm:block" />
              <span className="text-brand-700">It doesn’t tell you why.</span>
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              <p>
                <strong className="text-slate-900 font-bold font-mono text-xl">₹2,843.</strong> That’s the number you see on your electricity bill every month.
              </p>

              <ul className="space-y-2.5 text-slate-700 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Which appliance is actually responsible for that cost?</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Is your air conditioner consuming more than expected?</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Is an old refrigerator quietly adding to the monthly bill?</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Could a small habit change make a meaningful financial difference?</span>
                </li>
              </ul>

              <p className="pt-2 font-medium text-slate-900 text-lg border-l-4 border-brand-600 pl-4 py-1 bg-brand-50/50 rounded-r-lg">
                That’s what MINCHAL is built to answer.
              </p>
            </div>
          </div>

          {/* RIGHT: Visual Transformation of 1 Number into Appliance Attribution */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-soft-lg space-y-6">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 pb-3">
                Visual Transformation • Bill to Breakdown
              </div>

              {/* Single Bill Amount Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs text-slate-400 font-mono block">Month Total Bill Amount</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">₹2,843</span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    362 kWh
                  </span>
                </div>
              </div>

              {/* Transformation Arrow */}
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-brand-700 font-bold py-1">
                <span>ONE NUMBER</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
                <span>APPLIANCE ATTRIBUTION</span>
              </div>

              {/* Breakdown Bars */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>1. Air Conditioner</span>
                    <span className="font-mono text-amber-600">₹1,137 (40%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[40%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>2. Kitchen Refrigerator</span>
                    <span className="font-mono text-brand-700">₹568 (20%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full w-[20%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>3. Geyser & Water Heating</span>
                    <span className="font-mono text-blue-600">₹426 (15%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[15%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>4. Fans, Lights & Other Load</span>
                    <span className="font-mono text-slate-600">₹712 (25%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-slate-400 h-2 rounded-full w-[25%]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
