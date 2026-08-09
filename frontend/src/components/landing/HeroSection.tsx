import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShieldCheck, Zap, FileText, BarChart3 } from 'lucide-react';
import { SpecularButton } from './SpecularButton';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);

  // Auto-playing realistic product transformation sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

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
    <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
      {/* Soft background ambient glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-brand-100/50 via-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Human Product Introduction */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-bold uppercase tracking-wider font-mono">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              <span>Household Energy Audit</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Where does your electricity bill actually go?
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
              MINCHAL turns your electricity bill and appliance details into a simple household energy audit — so you can see what’s using the most, where efficiency is being lost, and what you can do about it.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <SpecularButton
                variant="primary"
                size="lg"
                onClick={handleStart}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Start an Energy Audit
              </SpecularButton>

              <button
                type="button"
                onClick={handleScrollToWorkflow}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-700 hover:bg-slate-100/80 transition-all group"
              >
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Privacy Badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Privacy first — No personal consumer account data stored</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Product Story Transformation Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6">
              
              {/* Product Visual Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-500 font-semibold ml-2">MINCHAL Product Preview</span>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/80 font-bold">
                  {animationStep === 0 ? 'Step 1 • Input' : animationStep === 1 ? 'Step 2 • Analyzing' : 'Step 3 • Breakdown'}
                </div>
              </div>

              {/* CARD 1: ELECTRICITY BILL INPUT */}
              <div className={`p-4 rounded-2xl bg-slate-50/90 border transition-all duration-500 ${
                animationStep === 0 ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20' : 'border-slate-200/80 opacity-90'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>ELECTRICITY BILL</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">Apr 2026</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-medium">Units Consumed</span>
                    <span className="text-base font-bold text-slate-900">362 kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-medium">Total Amount</span>
                    <span className="text-base font-bold text-emerald-600">₹2,843</span>
                  </div>
                </div>

                {/* Animated Scan Line */}
                {animationStep === 1 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-amber-700 font-mono font-medium animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>MINCHAL calculating appliance loads...</span>
                  </div>
                )}
              </div>

              {/* ARROW DOWN */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
                  ↓
                </div>
              </div>

              {/* CARD 2: MINCHAL ENERGY BREAKDOWN */}
              <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50/90 border transition-all duration-500 space-y-3.5 ${
                animationStep === 2 ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 text-xs font-extrabold">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>YOUR ENERGY BREAKDOWN</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Audit Complete
                  </span>
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 text-[11px] font-medium">
                      <span>Air Conditioner (1.5T 3★)</span>
                      <span className="font-mono font-bold text-amber-600">40% • ₹1,137</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-700" style={{ width: animationStep === 2 ? '40%' : '0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 text-[11px] font-medium">
                      <span>Kitchen Refrigerator (250L)</span>
                      <span className="font-mono font-bold text-emerald-600">20% • ₹568</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700" style={{ width: animationStep === 2 ? '20%' : '0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 text-[11px] font-medium">
                      <span>Bathroom Geyser (25L)</span>
                      <span className="font-mono font-bold text-blue-600">15% • ₹426</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-400 h-1.5 rounded-full transition-all duration-700" style={{ width: animationStep === 2 ? '15%' : '0%' }} />
                    </div>
                  </div>
                </div>

                {/* Savings Callout */}
                <div className="pt-2 border-t border-slate-200/90 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Potential Savings:</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm">
                    ~₹1,246 / month
                  </span>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAnimationStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      animationStep === idx ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
