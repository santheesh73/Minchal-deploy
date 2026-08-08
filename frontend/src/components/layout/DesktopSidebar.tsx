import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Zap,
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
import { Badge } from '../ui/Badge';

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

  const toggleLanguage = () => {
    const nextLang = state.language === 'en' ? 'ta' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  const navItems = [
    { to: '/', label: 'Home Landing', icon: Home, exact: true },
    { to: '/audit/bill', label: '1. Bill Upload', icon: FileText },
    { to: '/audit/appliances', label: '2. Appliances', icon: Cpu },
    { to: '/audit/analyzing', label: '3. Analysis Engine', icon: Calculator },
    { to: '/audit/result', label: '4. Energy Audit', icon: BarChart2 },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Branding */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-5 h-5 fill-current text-white" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                  MINCHAL
                  <Badge variant="primary" size="sm" className="bg-brand-600 text-white border-none">
                    Audit
                  </Badge>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {state.language === 'ta' ? 'மின்சார தணிக்கை' : 'Household Audit'}
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
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
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Details & Language Control */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic Engine</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              FastAPI backend calculations
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggleLanguage}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors focus:outline-none ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Switch Language / மொழியை மாற்று"
        >
          <Globe className="w-4 h-4 text-brand-400 shrink-0" />
          {!isCollapsed && <span>{state.language === 'en' ? 'தமிழ்' : 'English'}</span>}
        </button>
      </div>
    </aside>
  );
};
