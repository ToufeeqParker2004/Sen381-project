import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
interface TopNavigationProps {
  sidebarExpanded: boolean;
  className?: string;
}
export function TopNavigation({
  sidebarExpanded,
  className
}: TopNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications] = useState(3); // Mock notification count
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <header className={cn('fixed top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-sm transition-all duration-300 ease-smooth', sidebarExpanded ? 'left-sidebar-expanded' : 'left-sidebar-collapsed', 'right-0', className)}>
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Logo/Title (when sidebar collapsed) */}
        <div className="flex items-center space-x-4">
          {!sidebarExpanded}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search courses, tutors, resources..." className="w-full pl-9 pr-4 bg-muted/50 border-muted-foreground/20 focus:bg-background" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/api/placeholder/36/36" alt="Profile" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">JS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Student</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john@campus.edu
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