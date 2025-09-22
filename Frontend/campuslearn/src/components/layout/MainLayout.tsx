import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarMode } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('hover');

  // Load saved sidebar mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('sidebarMode') as SidebarMode;
    if (savedMode && ['expanded', 'collapsed', 'hover'].includes(savedMode)) {
      setSidebarMode(savedMode);
    }
  }, []);

  // Save sidebar mode to localStorage
  const handleModeChange = (mode: SidebarMode) => {
    setSidebarMode(mode);
    localStorage.setItem('sidebarMode', mode);
  };

  const isExpanded = sidebarMode === 'expanded';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mode={sidebarMode} onModeChange={handleModeChange} />
      <TopNavigation sidebarExpanded={isExpanded} />
      
      <main
        className={cn(
          'pt-16 transition-all duration-300 ease-smooth min-h-screen',
          isExpanded ? 'ml-sidebar-expanded' : 'ml-sidebar-collapsed'
        )}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}