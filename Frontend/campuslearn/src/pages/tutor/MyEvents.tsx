import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  MapPin,
  Plus,
  User,
  Mail,
  Phone,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CreateEventModal } from '@/components/ui/CreateEventModal';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Event {
  id: string;
  created_at: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  presenter: string;
  title: string;
  tutor_id: number | null;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  location?: string;
}

interface Tutor {
  id: number;
  studentId: number;
  // other tutor properties
}

interface FilterOptions {
  status: 'all' | 'upcoming' | 'past';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc';
}

export default function MyEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    sortBy: 'date_asc' // Default: oldest to newest
  });
  
  const { user, isAuthenticated } = useAuth();

  // Get tutor ID from student ID
  const fetchTutorId = async (studentId: number): Promise<number | null> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:9090/tutors/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tutorData = await response.json();
        return tutorData.id; // This is the actual tutor ID
      }
      return null;
    } catch (err) {
      console.error('Error fetching tutor ID:', err);
      return null;
    }
  };

  // Get tutor profile for authenticated tutor
  const fetchTutorProfile = async (): Promise<number | null> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:9090/tutors/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tutorData = await response.json();
        return tutorData.id; // This is the actual tutor ID
      }
      return null;
    } catch (err) {
      console.error('Error fetching tutor profile:', err);
      return null;
    }
  };

  // Fetch tutor's events using correct tutor ID
  const fetchTutorEvents = async (tutorId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:9090/events/tutor/${tutorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching tutor events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered students for an event
  const fetchRegisteredStudents = async (eventId: string) => {
    try {
      setStudentsLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:9090/student-events/event/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch registered students: ${response.status}`);
      }

      const studentsData = await response.json();
      setRegisteredStudents(studentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registered students');
      console.error('Error fetching registered students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Handle viewing registered students
  const handleViewStudents = async (event: Event) => {
    setSelectedEvent(event);
    setStudentsDialogOpen(true);
    await fetchRegisteredStudents(event.id);
  };

  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:9090/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }

      // Refresh events list
      if (tutorId) {
        await fetchTutorEvents(tutorId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  useEffect(() => {
    const initializeTutorEvents = async () => {
      if (isAuthenticated && user?.id) {
        try {
          setLoading(true);
          
          // Method 1: Try to get tutor profile first (for authenticated tutors)
          let fetchedTutorId = await fetchTutorProfile();
          
          // Method 2: If profile fails, try to get tutor by student ID
          if (!fetchedTutorId) {
            const studentId = parseInt(user.id);
            fetchedTutorId = await fetchTutorId(studentId);
          }

          if (fetchedTutorId) {
            setTutorId(fetchedTutorId);
            await fetchTutorEvents(fetchedTutorId);
          } else {
            setError('Tutor profile not found. Please ensure you are registered as a tutor.');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize tutor events');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeTutorEvents();
  }, [isAuthenticated, user?.id]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time to readable format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}hr${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`;
    }
    return `${diffMinutes}min`;
  };

  // Check if event is in the past
  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  // Check if event is within date range
  const isInDateRange = (dateString: string, range: FilterOptions['dateRange']) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    switch (range) {
      case 'today':
        return eventDate.toDateString() === today.toDateString();
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return eventDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return eventDate >= monthAgo;
      }
      default:
        return true;
    }
  };

  // Sort events based on sort option
  const sortEvents = (events: Event[], sortBy: FilterOptions['sortBy']) => {
    const sortedEvents = [...events];
    
    switch (sortBy) {
      case 'date_asc': // Oldest to newest
        return sortedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date_desc': // Newest to oldest
        return sortedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'title_asc':
        return sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sortedEvents;
    }
  };

  // Filter events based on search and filters
  const filteredEvents = sortEvents(
    events.filter((event) => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.presenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'upcoming' && !isPastEvent(event.date)) ||
        (filters.status === 'past' && isPastEvent(event.date));

      const matchesDateRange = isInDateRange(event.date, filters.dateRange);

      return matchesSearch && matchesStatus && matchesDateRange;
    }),
    filters.sortBy
  );

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      sortBy: 'date_asc'
    });
    setSearchQuery('');
  };

  // Get active filter count
  const activeFilterCount = [
    filters.status !== 'all',
    filters.dateRange !== 'all',
    filters.sortBy !== 'date_asc',
    searchQuery !== ''
  ].filter(Boolean).length;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Authentication Required</h3>
          <p className="text-muted-foreground mt-2">
            Please log in to manage your events
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage your created events and view registered students</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateEventOpen(true)}
          disabled={!tutorId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events, presenters, or locations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Status
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
                      <Checkbox checked={filters.status === 'all'} className="mr-2" />
                      All Events
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'upcoming' }))}>
                      <Checkbox checked={filters.status === 'upcoming'} className="mr-2" />
                      Upcoming
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'past' }))}>
                      <Checkbox checked={filters.status === 'past'} className="mr-2" />
                      Past Events
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Date Range
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}>
                      <Checkbox checked={filters.dateRange === 'all'} className="mr-2" />
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, dateRange: 'today' }))}>
                      <Checkbox checked={filters.dateRange === 'today'} className="mr-2" />
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, dateRange: 'week' }))}>
                      <Checkbox checked={filters.dateRange === 'week'} className="mr-2" />
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, dateRange: 'month' }))}>
                      <Checkbox checked={filters.dateRange === 'month'} className="mr-2" />
                      This Month
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Sort By
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'date_asc' }))}>
                      <Checkbox checked={filters.sortBy === 'date_asc'} className="mr-2" />
                      Date (Oldest First)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'date_desc' }))}>
                      <Checkbox checked={filters.sortBy === 'date_desc'} className="mr-2" />
                      Date (Newest First)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'title_asc' }))}>
                      <Checkbox checked={filters.sortBy === 'title_asc'} className="mr-2" />
                      Title (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: 'title_desc' }))}>
                      <Checkbox checked={filters.sortBy === 'title_desc'} className="mr-2" />
                      Title (Z-A)
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetFilters}>
                    Reset All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))} />
                  </Badge>
                )}
                {filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.dateRange}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))} />
                  </Badge>
                )}
                {filters.sortBy !== 'date_asc' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Sort: {filters.sortBy.replace('_', ' ')}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, sortBy: 'date_asc' }))} />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || activeFilterCount > 0 ? 'Try adjusting your search terms or filters' : "You haven't created any events yet"}
          </p>
          {!searchQuery && activeFilterCount === 0 && tutorId && (
            <Button 
              onClick={() => setCreateEventOpen(true)}
              className="mt-4"
            >
              Create Your First Event
            </Button>
          )}
          {(searchQuery || activeFilterCount > 0) && (
            <Button 
              onClick={resetFilters}
              variant="outline"
              className="mt-4"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isPast = isPastEvent(event.date);
            
            return (
              <Card key={event.id} className="hover:shadow-custom-lg transition-shadow">
                <div className={`aspect-video rounded-t-lg flex items-center justify-center ${
                  isPast ? 'bg-gray-100' : 'bg-gradient-subtle'
                }`}>
                  <Calendar className={`h-12 w-12 ${isPast ? 'text-gray-400' : 'text-primary'}`} />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        Presented by {event.presenter}
                      </CardDescription>
                    </div>
                    {isPast && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Past Event
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-3 w-3" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-3 w-3" />
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {calculateDuration(event.start_time, event.end_time)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewStudents(event)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Students
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isPast}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        onEventCreated={() => {
          if (tutorId) {
            fetchTutorEvents(tutorId);
          }
          setCreateEventOpen(false);
        }}
        tutorId={tutorId}
      />

      {/* Registered Students Dialog */}
      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registered Students</DialogTitle>
            <DialogDescription>
              Students registered for "{selectedEvent?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading students...</span>
            </div>
          ) : registeredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No students registered</h3>
              <p className="text-muted-foreground mt-2">
                No students have registered for this event yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {registeredStudents.length} student{registeredStudents.length !== 1 ? 's' : ''} registered
                </span>
              </div>
              
              <div className="space-y-3">
                {registeredStudents.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{student.email}</span>
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{student.phoneNumber}</span>
                            </div>
                          )}
                          {student.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{student.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}