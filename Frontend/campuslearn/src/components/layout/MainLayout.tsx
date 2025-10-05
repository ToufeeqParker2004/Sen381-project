import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarMode } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { PersistentMusicPlayer } from '@/components/ui/PersistentMusicPlayer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('hover');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Load saved sidebar mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('sidebarMode') as SidebarMode;
    if (savedMode && ['expanded', 'collapsed', 'hover'].includes(savedMode)) {
      setSidebarMode(savedMode);
    }
  }, []);

  // Close mobile sidebar when screen becomes desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile]);

  // Save sidebar mode to localStorage
  const handleModeChange = (mode: SidebarMode) => {
    setSidebarMode(mode);
    localStorage.setItem('sidebarMode', mode);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const isExpanded = !isMobile && sidebarMode === 'expanded';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        mode={isMobile ? 'expanded' : sidebarMode} 
        onModeChange={handleModeChange}
        isMobile={isMobile}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <TopNavigation 
        sidebarExpanded={isExpanded} 
        onMenuClick={toggleMobileSidebar}
        isMobile={isMobile}
      />
      
      <main
        className={cn(
          'pt-16 transition-all duration-300 ease-smooth min-h-screen',
          isMobile 
            ? 'ml-0' 
            : isExpanded 
              ? 'ml-sidebar-expanded' 
              : 'ml-sidebar-collapsed'
        )}
      >
        <div className={cn(
          "container mx-auto",
          isMobile ? "p-4" : "p-6"
        )}>
          {children}
        </div>
      </main>
      
      <PersistentMusicPlayer />
    </div>
  );
}