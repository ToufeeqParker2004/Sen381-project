import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  const { user, isAuthenticated } = useAuth();

  // Get current student ID from AuthContext
  const currentStudentId = user?.id ? parseInt(user.id) : null;

  // Fetch all events
  const fetchAllEvents = async (): Promise<Event[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:9090/events', {
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
      return eventsData;
    } catch (err) {
      console.error('Error fetching events:', err);
      throw err;
    }
  };

  // Fetch registered events for current student
  const fetchRegisteredEvents = async (): Promise<Event[]> => {
    if (!currentStudentId) return [];

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:9090/student-events/student/${currentStudentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const registeredData = await response.json();
        return registeredData;
      } else {
        return [];
      }
    } catch (err) {
      console.error('Error fetching registered events:', err);
      return [];
    }
  };

  // Check registration status for a specific event
  const checkEventRegistration = async (eventId: string): Promise<boolean> => {
    if (!currentStudentId) return false;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:9090/student-events/check-registration?studentId=${currentStudentId}&eventId=${eventId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const isRegistered = await response.json();
        return isRegistered;
      }
      return false;
    } catch (err) {
      console.error('Error checking registration:', err);
      return false;
    }
  };

  // Check registration status for all events
  const checkAllEventsRegistration = async (events: Event[]) => {
    if (!currentStudentId) return {};

    const status: Record<string, boolean> = {};
    
    // Check registration for each event
    for (const event of events) {
      try {
        const isRegistered = await checkEventRegistration(event.id);
        status[event.id] = isRegistered;
      } catch (err) {
        console.error(`Error checking registration for event ${event.id}:`, err);
        status[event.id] = false;
      }
    }
    
    return status;
  };

  // Fetch all data
  const fetchEvents = async () => {
    if (!isAuthenticated || !currentStudentId) return;

    try {
      setLoading(true);
      
      // Fetch all events
      const allEvents = await fetchAllEvents();
      setEvents(allEvents);

      // Fetch registered events and check registration status in parallel
      const [registeredEventsData, registrationStatusData] = await Promise.all([
        fetchRegisteredEvents(),
        checkAllEventsRegistration(allEvents)
      ]);

      setRegisteredEvents(registeredEventsData);
      setRegistrationStatus(registrationStatusData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAuthenticated, currentStudentId]);

  // Register for an event
  const handleRegister = async (eventId: string) => {
    if (!currentStudentId) {
      setError('Please log in to register for events');
      return;
    }

    try {
      setRegisterLoading(eventId);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:9090/student-events/register?studentId=${currentStudentId}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to register: ${response.status} - ${errorText}`);
      }

      // Update registration status
      setRegistrationStatus(prev => ({
        ...prev,
        [eventId]: true
      }));

      // Refresh registered events list
      const updatedRegisteredEvents = await fetchRegisteredEvents();
      setRegisteredEvents(updatedRegisteredEvents);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register for event');
      console.error('Error registering for event:', err);
    } finally {
      setRegisterLoading(null);
    }
  };

  // Unregister from an event
  const handleUnregister = async (eventId: string) => {
    if (!currentStudentId) {
      setError('Please log in to manage event registrations');
      return;
    }

    try {
      setRegisterLoading(eventId);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:9090/student-events/unregister?studentId=${currentStudentId}&eventId=${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to unregister: ${response.status} - ${errorText}`);
      }

      // Update registration status
      setRegistrationStatus(prev => ({
        ...prev,
        [eventId]: false
      }));

      // Refresh registered events list
      const updatedRegisteredEvents = await fetchRegisteredEvents();
      setRegisteredEvents(updatedRegisteredEvents);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister from event');
      console.error('Error unregistering from event:', err);
    } finally {
      setRegisterLoading(null);
    }
  };

  // Check if student is registered for an event
  const isRegistered = (eventId: string) => {
    return registrationStatus[eventId] || false;
  };

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

  // Sort events by date (earliest first)
  const sortEventsByDate = (events: Event[]) => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(events.map(event => event.location)));

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.presenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'upcoming' && new Date(event.date) >= new Date()) ||
      (dateFilter === 'past' && new Date(event.date) < new Date());

    const matchesLocation = locationFilter === 'all' || event.location === locationFilter;

    if (activeTab === 'registered') {
      return matchesSearch && matchesDate && matchesLocation && isRegistered(event.id);
    }

    return matchesSearch && matchesDate && matchesLocation;
  });

  // Apply sorting to filtered events
  const sortedEvents = sortEventsByDate(filteredEvents);

  // Clear all filters
  const clearFilters = () => {
    setDateFilter('all');
    setLocationFilter('all');
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = dateFilter !== 'all' || locationFilter !== 'all' || searchQuery !== '';

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Authentication Required</h3>
          <p className="text-muted-foreground mt-2">
            Please log in to view and register for events
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading events...</span>
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
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">Discover upcoming academic events and workshops</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="registered">
            My Events ({Object.values(registrationStatus).filter(status => status).length})
          </TabsTrigger>
        </TabsList>

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
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                      Active
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Select value={dateFilter} onValueChange={(value: 'all' | 'upcoming' | 'past') => setDateFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Dates</SelectItem>
                          <SelectItem value="upcoming">Upcoming Events</SelectItem>
                          <SelectItem value="past">Past Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} found
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Events Tab */}
        <TabsContent value="all" className="space-y-6">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || hasActiveFilters ? 'Try adjusting your search terms or filters' : 'No events are currently scheduled'}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <Button 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((event) => {
                const registered = isRegistered(event.id);
                const isPastEvent = new Date(event.date) < new Date();
                
                return (
                  <Card key={event.id} className={`hover:shadow-custom-lg transition-shadow ${
                    registered ? 'border-green-200' : ''
                  }`}>
                    <div className={`aspect-video rounded-t-lg flex items-center justify-center ${
                      registered 
                        ? 'bg-green-50' 
                        : isPastEvent 
                          ? 'bg-gray-100' 
                          : 'bg-gradient-subtle'
                    }`}>
                      <Calendar className={`h-12 w-12 ${
                        registered 
                          ? 'text-green-600' 
                          : isPastEvent 
                            ? 'text-gray-400' 
                            : 'text-primary'
                      }`} />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            Presented by {event.presenter}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {registered && (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Registered
                            </Badge>
                          )}
                          {isPastEvent && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Past Event
                            </Badge>
                          )}
                        </div>
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
                          className={`flex-1 ${
                            registered 
                              ? 'bg-destructive hover:bg-destructive/90' 
                              : isPastEvent
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-primary hover:opacity-90'
                          }`}
                          onClick={() => 
                            registered 
                              ? handleUnregister(event.id)
                              : !isPastEvent && handleRegister(event.id)
                          }
                          disabled={registerLoading === event.id || isPastEvent}
                        >
                          {registerLoading === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : registered ? (
                            'Unregister'
                          ) : isPastEvent ? (
                            'Event Ended'
                          ) : (
                            'Register'
                          )}
                        </Button>
                        <Button variant="outline" size="icon" disabled={isPastEvent}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Registered Events Tab */}
        <TabsContent value="registered" className="space-y-6">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No registered events</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || hasActiveFilters 
                  ? 'No registered events match your search' 
                  : 'You haven\'t registered for any events yet'
                }
              </p>
              {!searchQuery && !hasActiveFilters && (
                <Button 
                  onClick={() => setActiveTab('all')}
                  className="mt-4"
                >
                  Browse All Events
                </Button>
              )}
              {(searchQuery || hasActiveFilters) && (
                <Button 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((event) => {
                const isPastEvent = new Date(event.date) < new Date();
                
                return (
                  <Card key={event.id} className={`hover:shadow-custom-lg transition-shadow ${
                    isPastEvent ? 'border-gray-200' : 'border-green-200'
                  }`}>
                    <div className={`aspect-video rounded-t-lg flex items-center justify-center ${
                      isPastEvent ? 'bg-gray-100' : 'bg-green-50'
                    }`}>
                      <Calendar className={`h-12 w-12 ${isPastEvent ? 'text-gray-400' : 'text-green-600'}`} />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            Presented by {event.presenter}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Registered
                          </Badge>
                          {isPastEvent && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Past Event
                            </Badge>
                          )}
                        </div>
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
                          className="flex-1 bg-destructive hover:bg-destructive/90"
                          onClick={() => handleUnregister(event.id)}
                          disabled={registerLoading === event.id || isPastEvent}
                        >
                          {registerLoading === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isPastEvent ? (
                            'Event Ended'
                          ) : (
                            'Unregister'
                          )}
                        </Button>
                        <Button variant="outline" size="icon" disabled={isPastEvent}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}