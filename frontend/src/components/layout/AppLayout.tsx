import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isOnline } = useNetworkStatus();

  // Landing page ('/') is a standalone page with its own LandingHeader
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-900/95 lg:bg-slate-950 flex flex-col items-center justify-center text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="w-full bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You appear to be offline. Reconnect to perform new energy audits.</span>
        </div>
      )}

      {/* Main Mobile App Container - Locked for Desktop & Mobile */}
      <div className="w-full max-w-md min-h-screen lg:min-h-[92vh] lg:my-4 lg:rounded-3xl lg:border lg:border-slate-800 lg:shadow-2xl bg-slate-50 flex flex-col relative overflow-hidden pb-20">
        {isLandingPage ? (
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 w-full">{children}</div>
          </div>
        ) : (
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 w-full">{children}</div>
            <BottomNavigation />
          </div>
        )}
      </div>
    </div>
  );
};
