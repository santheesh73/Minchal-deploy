import React from 'react';
import { Eye, Calculator, MessageSquare } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const AIBoundarySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest font-mono">
            System Architecture & Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI helps us read. A calculation engine does the math.
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI is used where it helps most — reading bill documents and explaining results. The actual energy calculations follow fixed, explainable rules.
          </p>
        </div>

        {/* Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          
          {/* Stage 1: Perception */}
          <MagicBento variant="dark" glowColor="purple" className="p-6 space-y-4 bg-slate-800/90 border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase font-mono tracking-wider block">Stage 1 • Perception</span>
              <h3 className="text-lg font-bold text-white">AI Reads the Bill</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Perceives bill document pixels to extract billing period, total units, and slab charges without PII.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] text-purple-300 font-mono">
              Bill Photo → Structured Data
            </div>
          </MagicBento>

          {/* Stage 2: Math Engine */}
          <MagicBento variant="dark" glowColor="brand" className="p-6 space-y-4 bg-gradient-to-b from-brand-950 to-slate-800 border-brand-500/50">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-400 uppercase font-mono tracking-wider block">Stage 2 • Fixed Math</span>
              <h3 className="text-lg font-bold text-white">Calculation Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Backend engine attributes consumption, computes efficiency gaps, and applies tariff equations.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-brand-500/40 text-[11px] text-brand-300 font-mono">
              Fixed Deterministic Rules
            </div>
          </MagicBento>

          {/* Stage 3: Explanation */}
          <MagicBento variant="dark" glowColor="emerald" className="p-6 space-y-4 bg-slate-800/90 border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider block">Stage 3 • Explanation</span>
              <h3 className="text-lg font-bold text-white">AI Explains Results</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Translates exact engine calculations into clear bilingual explanations in Tamil and English.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] text-emerald-300 font-mono">
              Clear User Derivations
            </div>
          </MagicBento>

        </div>

      </div>
    </section>
  );
};
