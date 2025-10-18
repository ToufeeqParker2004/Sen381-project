import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Bell, Check, Trash2, ExternalLink, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications'; // Import Notification type
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,  // Get delete functions
    deleteAllNotifications // Get delete functions
  } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; notificationId: string | null }>({
    open: false,
    notificationId: null,
  });
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate(); // Initialize navigate

  // Filter notifications based on search term, filter type, and active tab
  const filteredNotifications = notifications.filter((notification) => {
    // Tab filtering
    if (activeTab === 'unread' && notification.status !== 'unread') return false;
    if (activeTab === 'read' && notification.status !== 'read') return false;
    
    // Type filtering
    if (filterType !== 'all' && notification.notification_type !== filterType) return false;
    
    // Search filtering
    if (searchTerm && !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getUniqueNotificationTypes = () => {
    const types = new Set(notifications.map(n => n.notification_type));
    return Array.from(types);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Use the function from your hook
      await deleteNotification(notificationId);
      // No need to refresh, hook updates state
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Use the function from your hook
      await deleteAllNotifications();
      // No need to refresh, hook updates state
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Handle clicking on a notification item
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if it's unread
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
    
    // Navigate if it's a message
    if (notification.notification_type === 'new_message') {
      navigate('/messages'); // Navigate to messages page
    }
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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* ... (rest of the header, search, and tabs are unchanged) ... */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                All types
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {getUniqueNotificationTypes().map((type) => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type.replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2 text-xs">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="read">
              Read
              <Badge variant="secondary" className="ml-2 text-xs">
                {notifications.length - unreadCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[600px] rounded-lg border">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
            <p className="text-sm">
              {notifications.length === 0 
                ? "You don't have any notifications yet."
                : "No notifications match your current filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 transition-colors hover:bg-accent/50 group relative cursor-pointer", // Added cursor-pointer
                  notification.status === 'unread' && 
                    "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
                )}
                onClick={() => handleNotificationClick(notification)} // Added onClick handler
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium capitalize",
                          notification.status === 'unread' && 
                            "text-blue-600 dark:text-blue-400 font-semibold"
                        )}>
                          {notification.notification_type.replace('_', ' ')}
                        </span>
                        {notification.status === 'unread' && (
                          <Badge variant="outline" className="text-xs">
                            Unread
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-foreground mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {notification.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop propagation
                            handleMarkAsRead(notification.id);
                          }}
                          className="h-8 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop propagation
                          setDeleteDialog({
                            open: true,
                            notificationId: notification.id
                          });
                        }}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer Actions */}
      {notifications.length > 0 && (
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAll} // This now works
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete all notifications
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, notificationId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.notificationId) {
                  handleDeleteNotification(deleteDialog.notificationId); // This now works
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}