import React from 'react';
import { ChromaGrid } from './ChromaGrid';

export const AuditPreviewSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Dashboard Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See Your Household's Energy Story
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            The final energy audit translates complex electrical data into a clear, actionable dashboard.
          </p>
        </div>

        {/* Mock Audit Dashboard Container with Vivid Colored ChromaGrid from ReactBits */}
        <div className="relative max-w-5xl mx-auto p-4 sm:p-8 rounded-3xl bg-slate-50/90 backdrop-blur-md border border-slate-200/90 shadow-soft-lg space-y-6 overflow-hidden group">
          {/* Vivid Colored Chroma Grid Background Component */}
          <ChromaGrid gridSize={32} chromaColors={['#ffbf00', '#38663d', '#ec4899', '#3b82f6', '#8b5cf6']} />

          {/* Header Strip */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase">Household Energy Audit Dashboard</span>
              <h3 className="text-xl font-bold text-slate-900">June - July 2026 Audit Result</h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold w-fit">
              92% Confidence Score
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Extracted Bill</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono">₹2,843</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1 shadow-xs hover:border-emerald-300 transition-colors">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Potential Savings</span>
              <p className="text-xl font-extrabold text-emerald-600 font-mono">~₹1,246 / mo</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1 shadow-xs hover:border-amber-300 transition-colors">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Efficiency Gap</span>
              <p className="text-xl font-extrabold text-amber-600 font-mono">43% Opportunity</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1 shadow-xs hover:border-purple-300 transition-colors">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Carbon Footprint</span>
              <p className="text-xl font-extrabold text-purple-600 font-mono">368 kg CO₂</p>
            </div>
          </div>

          {/* Appliance Breakdown Rows */}
          <div className="relative z-10 space-y-3 bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Appliance Monthly Load Attribution
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>1. Bedroom AC (1.5 Ton 3-Star)</span>
                  <span className="font-mono font-bold text-slate-900">₹1,137 • 40% Share</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full w-[40%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>2. Kitchen Refrigerator (250L)</span>
                  <span className="font-mono font-bold text-slate-900">₹568 • 20% Share</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>3. Bathroom Geyser (25L)</span>
                  <span className="font-mono font-bold text-slate-900">₹426 • 15% Share</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full w-[15%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
