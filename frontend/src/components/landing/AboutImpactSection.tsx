import React from 'react';
import { Leaf, Heart, Zap, Globe } from 'lucide-react';
import { Card } from '../ui/Card';

export const AboutImpactSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Mission & Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Making Household Energy Understandable & Sustainable
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            MINCHAL empowers households to lower electricity waste, reduce monthly utility expenditures, and shrink carbon footprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs max-w-5xl mx-auto">
          <Card variant="default" className="p-5 space-y-2 bg-white border-slate-200 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Carbon Reduction</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Every saved unit (kWh) prevents ~0.82 kg of CO₂ grid emissions.
            </p>
          </Card>

          <Card variant="default" className="p-5 space-y-2 bg-white border-slate-200 text-center">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Lower Monthly Bills</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Targeted habit adjustments yield up to 20-30% bill savings.
            </p>
          </Card>

          <Card variant="default" className="p-5 space-y-2 bg-white border-slate-200 text-center">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Appliance Longevity</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Timely maintenance prevents premature compressor and motor breakdown.
            </p>
          </Card>

          <Card variant="default" className="p-5 space-y-2 bg-white border-slate-200 text-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Tamil & English</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Fully localized for regional accessibility across households.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
