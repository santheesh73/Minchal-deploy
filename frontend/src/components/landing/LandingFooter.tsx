import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand Logo & Tagline */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-current text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                MINCHAL
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-assisted household energy audit platform. Turn electricity bills into explainable energy insights.
            </p>
          </div>

          {/* Quick Section Nav Links */}
          <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => handleScroll('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="hover:text-white transition-colors text-brand-400"
            >
              Start Audit
            </button>
          </div>
        </div>

        {/* Bottom Legal / Deterministic Engine Strip */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Calculation Engine • FastAPI + Gemini Perception</span>
          </div>

          <span>© {new Date().getFullYear()} MINCHAL Platform. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
