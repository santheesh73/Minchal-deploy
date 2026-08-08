import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { Logo } from '../ui/Logo';

export const Header: React.FC = () => {
  const { state, dispatch } = useAudit();

  const toggleLanguage = () => {
    const nextLang = state.language === 'en' ? 'ta' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo />

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Engine</span>
          </div>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            title="Switch Language / மொழியை மாற்று"
          >
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <span>{state.language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
