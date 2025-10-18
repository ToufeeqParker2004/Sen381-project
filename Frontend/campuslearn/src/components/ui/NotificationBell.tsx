// components/NotificationBell.tsx
import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications'; // Import Notification type
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Updated to accept the full notification object
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Add navigation logic here
    if (notification.notification_type === 'new_message') {
      navigate('/messages'); // Navigate to messages page
      setIsOpen(false); // Close the dropdown
    }
    // You could add else-if blocks for other notification types
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return '💬';
      case 'system':
        return '⚙️';
      case 'alert':
        return '⚠️';
      case 'success':
        return '✅';
      case 'assignment':
        return '🖊️';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 hover:bg-accent/50 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0 rounded-full animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[80vh]">
        <DropdownMenuLabel className="flex items-center justify-between sticky top-0 bg-background z-10">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-4 cursor-pointer border-b last:border-b-0 transition-colors",
                  notification.status === 'unread' 
                    ? "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleNotificationClick(notification)} // Pass the full object
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "text-sm font-medium capitalize line-clamp-1",
                        notification.status === 'unread' && "text-blue-600 dark:text-blue-400"
                      )}>
                        {notification.notification_type}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-xs text-center text-muted-foreground justify-center cursor-pointer hover:text-foreground"
              onClick={() => {
                navigate('notifications')
                setIsOpen(false);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}