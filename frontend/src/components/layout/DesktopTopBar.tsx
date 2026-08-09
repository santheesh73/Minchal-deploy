import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Globe } from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export const DesktopTopBar: React.FC = () => {
  const location = useLocation();
  const { state, dispatch } = useAudit();
  const t = getTranslation(state.language);

  const toggleLanguage = () => {
    const nextLang = state.language === 'en' ? 'ta' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith('/audit/bill')) return state.language === 'ta' ? 'மின் கட்டணப் பதிவேற்றம்' : 'Bill Upload & Extraction';
    if (path.startsWith('/audit/appliances')) return state.language === 'ta' ? 'வீட்டுச் சாதனங்கள் தேர்வு' : 'Appliance Selection & Configuration';
    if (path.startsWith('/audit/usage')) return state.language === 'ta' ? 'பயன்பாட்டு நேர அமைப்புகள்' : 'Usage Hours Configuration';
    if (path.startsWith('/audit/analyzing')) return state.language === 'ta' ? 'பகுப்பாய்வு இயங்குகிறது' : 'Analysis Processing Engine';
    if (path.startsWith('/audit/result')) return state.language === 'ta' ? 'மின்சார தணிக்கை கட்டுப்பாட்டு மையம்' : 'Household Energy Audit Dashboard';
    return state.language === 'ta' ? 'மின்சல் தணிக்கை' : 'MINCHAL Audit';
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 h-16 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.deterministicEngine}</span>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <Globe className="w-3.5 h-3.5 text-brand-600" />
          <span>{state.language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>
    </header>
  );
};
