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
  LayoutDashboard,
  Upload,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';

export type SidebarMode = 'expanded' | 'collapsed' | 'hover';

interface SidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [ 
  // Student navigation
  { icon: Home, label: 'Dashboard', path: '/', studentOnly: true },
  { icon: Calendar, label: 'Events', path: '/events', studentOnly: true },
  { icon: BookOpen, label: 'Tutors', path: '/tutors', studentOnly: true },
  { icon: FileText, label: 'My Resources', path: '/resources' , studentOnly: true },
  { icon: HelpCircle, label: 'FAQ', path: '/faq', studentOnly: true  },
  
  // Tutor navigation
  { icon: LayoutDashboard, label: 'Tutor Dashboard', path: '/tutor', tutorOnly: true },
  { icon: Users, label: 'My Students', path: '/tutor/students', tutorOnly: true },
  { icon: Calendar, label: 'My Events', path: '/tutor/events', tutorOnly: true },
  { icon: Upload, label: 'Content Upload', path: '/tutor/content', tutorOnly: true },
  
  // Shared navigation
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Bot, label: 'AI Tutor', path: '/ai-tutor' },
  
  // Admin navigation
  { icon: Settings, label: 'Admin Panel', path: '/admin', adminOnly: true },
];

export function Sidebar({ mode, onModeChange, className, isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState<'student' | 'tutor'>('student');
  const { user } = useAuth();
  const location = useLocation();
  
  const isAdmin = user?.isAdmin || false;
  const isTutor = user?.isTutor || false;
  

  const isExpanded = isMobile ? isOpen : (mode === 'expanded' || (mode === 'hover' && isHovered));
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
          'fixed left-0 top-0 h-full bg-sidebar-background/95 backdrop-blur-sm border-r border-sidebar-border transition-all duration-300 ease-smooth',
          isMobile 
            ? cn(
                'z-50 w-sidebar-expanded transform',
                isOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : cn(
                'z-40',
                isExpanded ? 'w-sidebar-expanded' : 'w-sidebar-collapsed'
              ),
          'shadow-custom-md',
          className
        )}
        style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
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
              // If user is admin, only show admin panel
              if (isAdmin && !item.adminOnly) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              // Filter based on view mode
              if (viewMode === 'student' && item.tutorOnly) return null;
              if (viewMode === 'tutor' && item.studentOnly) return null;
              
              // Hide tutor items if user is not a tutor
              if (item.tutorOnly && !isTutor) return null;
              
              const Icon = item.icon;

              const navButton = (
                  <NavLink
                  key={item.path}
                  to={item.path}
                  end
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
                  onClick={isMobile ? onClose : undefined}
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
            {/* Student/Tutor Switch - Show only if user is a tutor */}
            {isTutor && !isMobile && (
              <div className="mb-4">
                {showLabels ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-sidebar-foreground/60">View Mode</p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm transition-colors",
                        viewMode === 'student' ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/60"
                      )}>
                        Student
                      </span>
                      <Switch
                        checked={viewMode === 'tutor'}
                        onCheckedChange={(checked) => setViewMode(checked ? 'tutor' : 'student')}
                      />
                      <span className={cn(
                        "text-sm transition-colors",
                        viewMode === 'tutor' ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/60"
                      )}>
                        Tutor
                      </span>
                    </div>
                  </div>
                ) : (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <Switch
                          checked={viewMode === 'tutor'}
                          onCheckedChange={(checked) => setViewMode(checked ? 'tutor' : 'student')}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {viewMode === 'student' ? 'Switch to Tutor View' : 'Switch to Student View'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
            
            {/* Sidebar Controls - Hide on mobile */}
            {!isMobile && (
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
            )}

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
              onClick={isMobile ? onClose : undefined}
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
                  <p className="text-xs text-sidebar-foreground/60">{user?.identifier || 'user@campus.edu'}</p>
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}