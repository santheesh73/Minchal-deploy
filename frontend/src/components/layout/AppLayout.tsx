import React, { ReactNode } from 'react';
import { WifiOff } from 'lucide-react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-8">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-sm">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You appear to be offline. Reconnect to perform new energy audits.</span>
        </div>
      )}
      <Header />
      <div className="flex-1 w-full">{children}</div>
      <BottomNavigation />
    </div>
  );
};
