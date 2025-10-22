import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Settings, User, LogOut, Menu, Home, Calendar, BookOpen, MessageSquare, Users, GraduationCap, BarChart, Bell, HelpCircle, FileText, Upload, UserCheck, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface TopNavigationProps {
  sidebarExpanded: boolean;
  className?: string;
  onMenuClick?: () => void;
  isMobile?: boolean;
}
export function TopNavigation({
  sidebarExpanded,
  className,
  onMenuClick,
  isMobile = false
}: TopNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Define navigation routes based on user role
  const navigationRoutes = useMemo(() => {
    if (user?.isAdmin) {
      return [
        { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
        { icon: ClipboardList, label: 'Tutor Applications', path: '/tutor-applications' },
      ];
    } else if (user?.isTutor) {
      return [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Users, label: 'My Students', path: '/tutor/my-students' },
        { icon: Calendar, label: 'My Events', path: '/tutor/my-events' },
        { icon: Upload, label: 'Content Upload', path: '/tutor/content-upload' },
        { icon: BookOpen, label: 'Resources', path: '/resources' },
        { icon: MessageSquare, label: 'Forum', path: '/forum' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: HelpCircle, label: 'FAQ', path: '/faq' },
      ];
    } else {
      return [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: GraduationCap, label: 'AI Tutor', path: '/ai-tutor' },
        { icon: Users, label: 'Tutors', path: '/tutors' },
        { icon: BookOpen, label: 'Resources', path: '/resources' },
        { icon: MessageSquare, label: 'Forum', path: '/forum' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: BarChart, label: 'Progress', path: '/progress' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: HelpCircle, label: 'FAQ', path: '/faq' },
      ];
    }
  }, [user]);

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return navigationRoutes;
    const query = searchQuery.toLowerCase();
    return navigationRoutes.filter(route => 
      route.label.toLowerCase().includes(query)
    );
  }, [searchQuery, navigationRoutes]);

  const handleRouteSelect = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <header className={cn(
    'fixed top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-sm transition-all duration-300 ease-smooth',
    isMobile 
      ? 'left-0' 
      : sidebarExpanded 
        ? 'left-sidebar-expanded' 
        : 'left-sidebar-collapsed',
    'right-0', 
    className
  )}>
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left Section - Mobile menu button / Logo */}
        <div className="flex items-center space-x-4">
          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            !sidebarExpanded && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                  CL
                </div>
                <span className="font-semibold text-lg hidden sm:block">CampusLearn</span>
              </div>
            )
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 md:mx-8">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Input 
                  type="search" 
                  placeholder={isMobile ? "Search pages..." : "Search navigation pages..."} 
                  className="w-full pl-9 pr-4 bg-muted/50 border-muted-foreground/20 focus:bg-background text-sm" 
                  value={searchQuery} 
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-0" 
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command>
                <CommandList>
                  <CommandEmpty>No pages found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    {filteredRoutes.map((route) => {
                      const Icon = route.icon;
                      const isActive = location.pathname === route.path;
                      return (
                        <CommandItem
                          key={route.path}
                          onSelect={() => handleRouteSelect(route.path)}
                          className={cn(
                            "cursor-pointer",
                            isActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{route.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0">
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                  <AvatarImage src="/api/placeholder/36/36" alt="Profile" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs md:text-sm">{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 md:w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.identifier || "-"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}