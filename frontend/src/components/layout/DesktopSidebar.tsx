import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Cpu,
  Calculator,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { useAudit } from '../../store/AuditContext';
import { Logo } from '../ui/Logo';
import { getTranslation } from '../../utils/translations';

export interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { state, dispatch } = useAudit();
  const t = getTranslation(state.language);

  const toggleLanguage = () => {
    const nextLang = state.language === 'en' ? 'ta' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  const navItems = [
    { to: '/', label: t.home, icon: Home, exact: true },
    { to: '/audit/bill', label: `1. ${t.billUpload}`, icon: FileText },
    { to: '/audit/appliances', label: `2. ${t.appliances}`, icon: Cpu },
    { to: '/audit/analyzing', label: `3. ${state.language === 'ta' ? 'பகுப்பாய்வு' : 'Analysis Engine'}`, icon: Calculator },
    { to: '/audit/result', label: `4. ${t.auditResults}`, icon: BarChart2 },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-white border-r border-slate-200/90 text-slate-900 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Branding */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Logo showText={!isCollapsed} size="md" />

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Details & Language Control */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.deterministicEngine}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {state.language === 'ta' ? 'துல்லியமான FastAPI கணக்கீடு' : 'FastAPI backend calculations'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggleLanguage}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors focus:outline-none ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Switch Language / மொழியை மாற்று"
        >
          <Globe className="w-4 h-4 text-brand-600 shrink-0" />
          {!isCollapsed && <span>{state.language === 'en' ? 'தமிழ்' : 'English'}</span>}
        </button>
      </div>
    </aside>
  );
};
