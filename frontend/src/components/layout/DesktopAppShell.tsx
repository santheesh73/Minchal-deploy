import React, { useState, ReactNode } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopTopBar } from './DesktopTopBar';

export interface DesktopAppShellProps {
  children: ReactNode;
}

export const DesktopAppShell: React.FC<DesktopAppShellProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Desktop Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DesktopTopBar />
        <main className="flex-1 w-full p-6">{children}</main>
      </div>
    </div>
  );
};
