import React from 'react';
import { Smartphone, Zap, Shield } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const WhyMinchalSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Zero Barriers to Entry
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            No Smart Meter. No Hardware. No Installation.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Turn the electricity bill and household appliances you already have into an instant, actionable energy audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <MagicBento glowColor="brand" className="p-6 space-y-3 bg-white text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-glow">
              <Zap className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Uses Existing EB Bill</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No new hardware, sensors, or smart meter subscriptions required. Works directly from your monthly paper or PDF bill.
            </p>
          </MagicBento>

          <MagicBento glowColor="brand" className="p-6 space-y-3 bg-white text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-glow">
              <Smartphone className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Works on Any Smartphone</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accessible web application and installable PWA designed for touchscreens, mobile viewports, and desktop browsers.
            </p>
          </MagicBento>

          <MagicBento glowColor="brand" className="p-6 space-y-3 bg-white text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-glow">
              <Shield className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Privacy & Safety Locked</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consumer name, service number, and residential address are deliberately excluded from data extraction and storage.
            </p>
          </MagicBento>
        </div>
      </div>
    </section>
  );
};
