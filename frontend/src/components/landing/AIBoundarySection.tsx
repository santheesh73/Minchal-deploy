import React from 'react';
import { Eye, Calculator, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';

export const AIBoundarySection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-slate-900 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest font-mono">
            System Architecture & Technical Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Reads. The Engine Calculates. AI Explains.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            MINCHAL strictly separates AI perception from mathematical computation. Rupee values, unit allocations, and efficiency metrics are computed by a 100% deterministic backend calculation engine.
          </p>
        </div>

        {/* 3 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative max-w-5xl mx-auto items-stretch">
          {/* Pipeline Stage 1 */}
          <Card variant="default" className="p-6 space-y-4 bg-slate-800/90 border-slate-700/80 text-white relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Stage 1 • Perception</span>
              <h3 className="text-lg font-bold text-white">Gemini Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Perceives bill document pixels and extracts structured data (units, billing period, charges).
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-[11px] text-purple-300 font-mono">
              Input: Image Pixels → Structured JSON
            </div>
          </Card>

          {/* Pipeline Stage 2 */}
          <Card variant="default" className="p-6 space-y-4 bg-gradient-to-b from-brand-900/80 to-slate-800/90 border-brand-500/50 text-white relative shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Stage 2 • Deterministic Math</span>
              <h3 className="text-lg font-bold text-white">Energy Calculation Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Computes appliance load attribution, efficiency gaps, and cost normalization using tariff equations.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-brand-500/40 text-[11px] text-brand-300 font-mono">
              Output: Exact Reproducible Numbers
            </div>
          </Card>

          {/* Pipeline Stage 3 */}
          <Card variant="default" className="p-6 space-y-4 bg-slate-800/90 border-slate-700/80 text-white relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Stage 3 • Explanation</span>
              <h3 className="text-lg font-bold text-white">Gemini Flash</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Translates engine calculations into accessible bilingual explanations (Tamil & English).
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-[11px] text-emerald-300 font-mono">
              Output: Clear User Derivations
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
