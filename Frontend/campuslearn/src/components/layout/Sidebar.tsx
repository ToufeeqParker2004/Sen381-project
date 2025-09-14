import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  MessageCircle,
  FileText,
  Calendar,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';

export type SidebarMode = 'expanded' | 'collapsed' | 'hover';

interface SidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  className?: string;
}

const navigationItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Courses / Tutors', path: '/courses' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: FileText, label: 'Resources', path: '/resources' },
  { icon: Calendar, label: 'Calendar / Events', path: '/calendar' },
  { icon: Bot, label: 'AI Tutor', path: '/ai-tutor' },
  { icon: HelpCircle, label: 'FAQ', path: '/faq' },
  { icon: BookOpen, label: 'Tutor Dashboard', path: '/tutor', tutorOnly: true },
  { icon: Settings, label: 'Admin Panel', path: '/admin', adminOnly: true },
];

export function Sidebar({ mode, onModeChange, className }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  const isAdmin = user?.isAdmin || false;
  const isTutor = user?.isTutor || false;

  const isExpanded = mode === 'expanded' || (mode === 'hover' && isHovered);
  const showLabels = isExpanded;

  const handleMouseEnter = () => {
    if (mode === 'hover') {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (mode === 'hover') {
      setIsHovered(false);
    }
  };

  const toggleMode = () => {
    if (mode === 'expanded') {
      onModeChange('collapsed');
    } else {
      onModeChange('expanded');
    }
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-sidebar-background/95 backdrop-blur-sm border-r border-sidebar-border transition-all duration-300 ease-smooth',
          isExpanded ? 'w-sidebar-expanded' : 'w-sidebar-collapsed',
          'shadow-custom-md',
          className
        )}
        style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
            {showLabels ? (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                  CL
                </div>
                <span className="font-semibold text-lg text-sidebar-foreground">CampusLearn</span>
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                CL
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              if (item.tutorOnly && !isTutor) return null;
              
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              const navButton = (
                  <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      showLabels ? 'space-x-3' : 'justify-center',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-custom-sm'
                        : 'text-sidebar-foreground hover:text-sidebar-primary'
                    )
                  }
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    !showLabels && "text-sidebar-primary" // Make icons visible when collapsed
                  )} />
                  {showLabels && <span className="truncate">{item.label}</span>}
                </NavLink>
              );

              if (!showLabels) {
                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navButton;
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border p-4">
            {/* Sidebar Controls */}
            <div className="mb-4">
              {showLabels ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-sidebar-foreground/60">Sidebar Mode</p>
                  <div className="flex space-x-1">
                    {(['expanded', 'collapsed', 'hover'] as const).map((modeOption) => (
                      <Button
                        key={modeOption}
                        size="sm"
                        variant={mode === modeOption ? 'default' : 'outline'}
                        className="flex-1 text-xs"
                        onClick={() => onModeChange(modeOption)}
                      >
                        {modeOption === 'expanded' && 'Full'}
                        {modeOption === 'collapsed' && 'Mini'}
                        {modeOption === 'hover' && 'Auto'}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={toggleMode}
                    >
                      {mode === 'collapsed' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    {mode === 'collapsed' ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Profile Section */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg p-3 transition-all duration-200',
                  showLabels ? 'space-x-3' : 'justify-center',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:text-sidebar-primary'
                )
              }
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {showLabels && (
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-sidebar-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-sidebar-foreground/60">{user?.email || 'user@campus.edu'}</p>
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}