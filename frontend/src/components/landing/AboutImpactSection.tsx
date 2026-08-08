import React from 'react';
import { Leaf, Heart, Zap, Globe } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const AboutImpactSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-mono">
            About MINCHAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            We built MINCHAL to make electricity easier to understand.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Electricity is one of those things we use every day but rarely see clearly. The bill arrives, we pay it, and move on. MINCHAL turns that monthly bill into a clearer picture of how your home uses energy — and where small changes may make a difference.
          </p>
        </div>

        {/* 4 Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-xs">
          <MagicBento glowColor="emerald" className="p-5 space-y-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Carbon Footprint</h4>
            <p className="text-slate-500 leading-relaxed">
              Every saved unit (kWh) prevents ~0.82 kg of CO₂ grid emissions.
            </p>
          </MagicBento>

          <MagicBento glowColor="brand" className="p-5 space-y-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Lower Monthly Bills</h4>
            <p className="text-slate-500 leading-relaxed">
              Targeted habit adjustments yield up to 20-30% bill savings.
            </p>
          </MagicBento>

          <MagicBento glowColor="purple" className="p-5 space-y-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Appliance Longevity</h4>
            <p className="text-slate-500 leading-relaxed">
              Timely maintenance prevents premature compressor and motor breakdown.
            </p>
          </MagicBento>

          <MagicBento glowColor="amber" className="p-5 space-y-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-amber-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Tamil & English</h4>
            <p className="text-slate-500 leading-relaxed">
              Fully localized for regional accessibility across households.
            </p>
          </MagicBento>
        </div>

      </div>
    </section>
  );
};
