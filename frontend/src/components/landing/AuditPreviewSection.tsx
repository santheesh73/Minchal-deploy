import React from 'react';
import { ChromaGrid } from './ChromaGrid';

export const AuditPreviewSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-mono">
            Product Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Here's what your bill can become.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            A clear, actionable dashboard showing exactly how your household energy breaks down.
          </p>
        </div>

        {/* Polished Mock Audit Dashboard Container */}
        <div className="relative max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft-lg space-y-6 overflow-hidden">
          {/* Vivid Colored ChromaGrid Background */}
          <ChromaGrid gridSize={32} chromaColors={['#ffbf00', '#38663d', '#ec4899', '#3b82f6', '#8b5cf6']} />

          {/* Top Label Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase font-mono tracking-wider">
                EXAMPLE HOUSEHOLD AUDIT
              </span>
              <h3 className="text-xl font-bold text-slate-900">June - July 2026 Audit Result</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Sample Data
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Your Bill</span>
              <p className="text-xl font-extrabold text-slate-900">₹2,843</p>
            </div>

            <div className="p-4 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Potential Savings</span>
              <p className="text-xl font-extrabold text-emerald-600">₹1,246 / mo</p>
            </div>

            <div className="p-4 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Efficiency Gap</span>
              <p className="text-xl font-extrabold text-amber-600">43%</p>
            </div>

            <div className="p-4 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">CO₂ Impact</span>
              <p className="text-xl font-extrabold text-purple-600">368 kg</p>
            </div>
          </div>

          {/* Appliance Breakdown */}
          <div className="relative z-10 p-5 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm font-mono border-b border-slate-200 pb-2">
              Energy by Appliance
            </h4>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-800 mb-1">
                  <span>Air Conditioner (1.5 Ton 3★)</span>
                  <span className="font-mono font-bold text-slate-900">40% • ₹1,137</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full w-[40%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800 mb-1">
                  <span>Kitchen Refrigerator (250L)</span>
                  <span className="font-mono font-bold text-slate-900">20% • ₹568</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800 mb-1">
                  <span>Bathroom Geyser (25L)</span>
                  <span className="font-mono font-bold text-slate-900">15% • ₹426</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[15%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800 mb-1">
                  <span>Washing Machine (Front Load)</span>
                  <span className="font-mono font-bold text-slate-900">10% • ₹284</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[10%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800 mb-1">
                  <span>Others (Fans, Lights, TV)</span>
                  <span className="font-mono font-bold text-slate-900">15% • ₹428</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div className="bg-slate-400 h-2 rounded-full w-[15%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
