import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MagicBento variant="dark" glowColor="emerald" className="p-8 sm:p-10 bg-gradient-to-br from-brand-900 via-slate-900 to-slate-900 text-white rounded-3xl border-slate-800 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Built on Trust, Privacy & Deterministic Math</h3>
              <p className="text-xs text-slate-400">Guaranteed reproducible energy audit engineering</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="space-y-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero PII Extraction</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Account numbers and home address are never parsed or stored.
              </p>
            </div>

            <div className="space-y-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Tariff Normalization</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Sum of appliance estimates is normalized strictly against actual bill totals.
              </p>
            </div>

            <div className="space-y-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Fully Explainable</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every calculation step and baseline assumption is inspectable.
              </p>
            </div>
          </div>
        </MagicBento>
      </div>
    </section>
  );
};
