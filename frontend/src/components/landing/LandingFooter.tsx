import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="space-y-1">
            <Logo size="md" />
            <p className="text-xs text-slate-500 font-medium">
              AI-assisted Household Energy Audit
            </p>
          </div>

          {/* Clean Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollTo('outcomes')}
              className="hover:text-white transition-colors"
            >
              What you get
            </button>
            <button
              type="button"
              onClick={() => scrollTo('why-minchal')}
              className="hover:text-white transition-colors"
            >
              Why MINCHAL
            </button>
            <button
              type="button"
              onClick={() => scrollTo('about')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="text-brand-400 font-bold hover:underline"
            >
              Start an Audit →
            </button>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} MINCHAL. All rights reserved.</p>
          <p className="font-mono">Privacy-First Household Energy Audit</p>
        </div>
      </div>
    </footer>
  );
};
