import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { DesktopAppShell } from './DesktopAppShell';
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You appear to be offline. Reconnect to perform new energy audits.</span>
        </div>
      )}

      {isLandingPage ? (
        /* Standalone Landing Page View - Uses LandingHeader & LandingFooter */
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 w-full">{children}</div>
        </div>
      ) : (
        /* Application Routes View (/audit/*) - Unchanged Application Shell */
        <>
          {/* Mobile View (< 1024px): Application Mobile Shell */}
          <div className="lg:hidden min-h-screen flex flex-col pb-16 sm:pb-8">
            <Header />
            <div className="flex-1 w-full">{children}</div>
            <BottomNavigation />
          </div>

          {/* Desktop View (>= 1024px): Desktop Application Shell with Sidebar */}
          <div className="hidden lg:block min-h-screen">
            <DesktopAppShell>{children}</DesktopAppShell>
          </div>
        </>
      )}
    </div>
  );
};
