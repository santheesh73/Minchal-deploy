import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Cpu,
  Calculator,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  const handleScrollToWorkflow = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-6 pb-12 sm:pb-20 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50/80 via-blue-50/40 to-transparent pointer-events-none -z-10 rounded-b-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Hero Header Content */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>AI Perception + Deterministic Energy Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
            Understand Where Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600">
              Electricity Bill
            </span>{' '}
            Goes
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Turn one electricity bill into a clear household energy audit — with appliance-level cost attribution, efficiency gaps, potential savings, and explainable math calculations.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all"
            >
              Start Your Energy Audit
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleScrollToWorkflow}
              rightIcon={<ChevronDown className="w-4 h-4 text-slate-500" />}
              className="w-full sm:w-auto px-6 py-4 text-sm font-semibold border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              See How It Works
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy First — No personal consumer account data stored</span>
          </div>
        </div>

        {/* Hero Interactive Visualization Showcase */}
        <div className="relative max-w-4xl mx-auto rounded-3xl bg-slate-900 text-white p-4 sm:p-8 shadow-2xl border border-slate-800 space-y-6 overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

          {/* Top Mock Window Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">MINCHAL Audit Preview</span>
            </div>
            <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Live Demo Pipeline
            </Badge>
          </div>

          {/* Pipeline Visual Flow */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Step 1 Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step 01 • Input</span>
              <p className="font-bold text-white text-sm">EB Electricity Bill</p>
              <div className="pt-1 text-[11px] text-slate-300 font-mono space-y-0.5">
                <div>Units: <span className="text-blue-400 font-bold">362 kWh</span></div>
                <div>Amount: <span className="text-emerald-400 font-bold">₹2,843</span></div>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step 02 • AI Vision</span>
              <p className="font-bold text-white text-sm">Gemini Perception</p>
              <p className="text-[11px] text-slate-400 leading-snug">
                Extracts tariff, billing period, and total consumption without PII.
              </p>
            </div>

            {/* Step 3 Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step 03 • Appliances</span>
              <p className="font-bold text-white text-sm">Appliance Logs</p>
              <p className="text-[11px] text-slate-400 leading-snug">
                AC (1.5T 3★), Refrigerator (250L), Geyser, Fans & Lights.
              </p>
            </div>

            {/* Step 4 Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-900/90 to-emerald-950/90 border border-brand-500/40 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Step 04 • Audit</span>
              <p className="font-bold text-white text-sm">Energy Audit</p>

              {/* Mini Breakdown Preview */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">AC (40%)</span>
                  <span className="font-mono font-bold text-amber-400">₹1,137</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 rounded-full w-[40%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Highlight Strip */}
          <div className="relative z-10 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Potential Savings Opportunity Identified: <strong className="text-white">up to ~₹1,246 / month</strong></span>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 underline shrink-0"
            >
              Analyze Your Bill →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
