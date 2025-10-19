import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  Video,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths, parseISO, isSameDay } from 'date-fns';
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
  type: 'event' | 'lesson' | 'personal';
  subject?: string;
  tutorName?: string;
  status?: string;
  description?: string;
  color?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [lessons, setLessons] = useState<Event[]>([]);
  const [personalEvents, setPersonalEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [registerLoading, setRegisterLoading] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<Record<string, boolean>>({});
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    color: 'blue'
  });

  const { user, isAuthenticated } = useAuth();

  // Get current student ID from AuthContext
  const currentStudentId = user?.id ? parseInt(user.id) : null;

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // === PERSONAL EVENTS FUNCTIONS ===
  // Fetch personal events from backend
  const fetchPersonalEvents = async () => {
    if (!currentStudentId) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:9090/api/personal-events/student/${currentStudentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch personal events: ${response.status}`);
      }

      const personalEventsData = await response.json();
      const eventsWithType = personalEventsData.map((event: any) => ({
        id: `personal-${event.id}`,
        created_at: event.createdAt || new Date().toISOString(),
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        location: event.location,
        presenter: 'You',
        title: event.title,
        tutor_id: null,
        type: 'personal',
        description: event.description,
        color: event.color
      }));
      setPersonalEvents(eventsWithType);
    } catch (err) {
      console.error('Error fetching personal events:', err);
    }
  };

  // Add new personal event to backend
  const handleAddPersonalEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !currentStudentId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:9090/api/personal-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          startTime: newEvent.start_time,
          endTime: newEvent.end_time,
          location: newEvent.location,
          color: newEvent.color,
          studentId: currentStudentId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${response.status} - ${errorText}`);
      }

      const createdEvent = await response.json();

      // Add the new event to state
      const eventWithType: Event = {
        id: `personal-${createdEvent.id}`,
        created_at: createdEvent.createdAt || new Date().toISOString(),
        date: createdEvent.date,
        start_time: createdEvent.startTime,
        end_time: createdEvent.endTime,
        location: createdEvent.location,
        presenter: 'You',
        title: createdEvent.title,
        tutor_id: null,
        type: 'personal', // This will now be recognized as the literal type
        description: createdEvent.description,
        color: createdEvent.color
      };

      setPersonalEvents(prev => [...prev, eventWithType]);

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        color: 'blue'
      });
      setIsAddEventDialogOpen(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      console.error('Error creating personal event:', err);
    }
  };

  // Delete personal event
  const handleDeletePersonalEvent = async (eventId: string) => {
    try {
      const token = getAuthToken();
      // Extract numeric ID for the backend
      const numericId = eventId.replace('personal-', '');

      const response = await fetch(`http://localhost:9090/api/personal-events/${numericId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete event: ${response.status} - ${errorText}`);
      }

      // Remove from state
      setPersonalEvents(prev => prev.filter(event => event.id !== eventId));

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      if (selectedDateEvents.some(event => event.id === eventId)) {
        setSelectedDateEvents(prev => prev.filter(event => event.id !== eventId));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting personal event:', err);
    }
  };

  // Handle day click to show all events for that day
  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    setSelectedDate(day);
    setSelectedDateEvents(dayEvents);
    // If there's only one event, show its details, otherwise show the list
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
    } else {
      setSelectedEvent(null);
    }
  };

  // === YOUR EXISTING CODE - NO CHANGES ===
  // Fetch tutor name by ID - using the same endpoint as Dashboard
  const fetchTutorStudentDetails = async (tutorId: number): Promise<string> => {
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:9090/student/by-tutor/${tutorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch student for tutor ${tutorId}`);
      const student = await res.json();
      return student.name || 'Unknown Tutor';
    } catch (error) {
      console.error('Error fetching tutor student details:', error);
      return 'Unknown Tutor';
    }
  };

  // Fetch events from API
  const fetchEvents = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getAuthToken();
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
      // Add type to events
      const eventsWithType = eventsData.map((event: any) => ({
        ...event,
        type: 'event'
      }));
      setEvents(eventsWithType);

      // Check registration status for all events
      if (currentStudentId) {
        const status = await checkAllEventsRegistration(eventsWithType);
        setRegistrationStatus(status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved lessons for current student
  const fetchLessons = async () => {
    if (!currentStudentId) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:9090/api/bookings/student/${currentStudentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.status}`);
      }

      const lessonsData = await response.json();

      // Fetch tutor names for all lessons and transform them
      const lessonsWithTutorNames = await Promise.all(
        lessonsData
          .filter((lesson: any) => lesson.status === 'accepted')
          .map(async (lesson: any) => {
            const startDate = new Date(lesson.startDatetime);
            const endDate = new Date(lesson.endDatetime);
            const tutorName = await fetchTutorStudentDetails(lesson.tutorId);

            return {
              id: `lesson-${lesson.id}`,
              created_at: lesson.created_at || new Date().toISOString(),
              date: format(startDate, 'yyyy-MM-dd'),
              start_time: format(startDate, 'HH:mm'),
              end_time: format(endDate, 'HH:mm'),
              location: lesson.location || 'TBA',
              presenter: tutorName,
              title: `${lesson.subject} Lesson`,
              tutor_id: lesson.tutorId,
              type: 'lesson',
              subject: lesson.subject,
              tutorName: tutorName,
              status: lesson.status
            };
          })
      );

      setLessons(lessonsWithTutorNames);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  // Check registration status for a specific event
  const checkEventRegistration = async (eventId: string): Promise<boolean> => {
    if (!currentStudentId) return false;

    try {
      const token = getAuthToken();
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

    for (const event of events) {
      // Skip lessons for registration check
      if (event.type === 'lesson') continue;

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

  // Register for an event
  const handleRegister = async (eventId: string) => {
    if (!currentStudentId) {
      setError('Please log in to register for events');
      return;
    }

    try {
      setRegisterLoading(eventId);
      const token = getAuthToken();

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
      const token = getAuthToken();

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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister from event');
      console.error('Error unregistering from event:', err);
    } finally {
      setRegisterLoading(null);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Get combined events and lessons - UPDATED TO INCLUDE PERSONAL EVENTS
  const getCombinedEvents = () => {
    return [...events, ...lessons, ...personalEvents];
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const combinedEvents = getCombinedEvents();
    return combinedEvents.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Get upcoming events (next 3 events)
  const getUpcomingEvents = () => {
    const today = new Date();
    const combinedEvents = getCombinedEvents();
    const upcoming = combinedEvents
      .filter(event => parseISO(event.date) >= today)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3);

    return upcoming;
  };

  const getEventIcon = (event: Event) => {
    if (event.type === 'lesson') {
      return BookOpen;
    }
    if (event.type === 'personal') {
      return CalendarIcon;
    }

    const title = event.title.toLowerCase();
    const presenter = event.presenter.toLowerCase();

    if (title.includes('study group') || presenter.includes('study group')) {
      return Users;
    } else if (title.includes('lab') || title.includes('laboratory')) {
      return CalendarIcon;
    } else if (title.includes('review') || presenter.includes('review')) {
      return Video;
    } else {
      return BookOpen;
    }
  };

  const getEventColor = (event: Event) => {
    // Personal events use their stored color
    if (event.type === 'personal' && event.color) {
      const colorMap: { [key: string]: string } = {
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200'
      };
      return colorMap[event.color] || colorMap.blue;
    }

    if (event.type === 'lesson') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }

    const title = event.title.toLowerCase();
    const presenter = event.presenter.toLowerCase();

    if (title.includes('study group') || presenter.includes('study group')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (title.includes('lab') || title.includes('laboratory')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (title.includes('review') || presenter.includes('review')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const isRegistered = (eventId: string) => {
    // Lessons and personal events are always considered "registered"
    if (eventId.startsWith('lesson-') || eventId.startsWith('personal-')) {
      return true;
    }
    return registrationStatus[eventId] || false;
  };

  const isPastEvent = (event: Event) => {
    const eventDate = parseISO(event.date);
    return eventDate < new Date();
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDateEvents([]);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const calendarDays = getCalendarDays();
  const upcomingEvents = getUpcomingEvents();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchLessons(), fetchPersonalEvents()]);
      setLoading(false);
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentStudentId]);

  // === RENDER SECTION - MINIMAL CHANGES ===
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Authentication Required</h3>
          <p className="text-muted-foreground mt-2">
            Please log in to view your calendar
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading calendar...</span>
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
          <h1 className="text-3xl font-bold">Calendar & Events</h1>
          <p className="text-muted-foreground">Manage your study schedule and sessions</p>
        </div>
        {/* ADD PERSONAL EVENT BUTTON */}
        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Personal Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Personal Event</DialogTitle>
              <DialogDescription>
                Create a personal event that only you can see.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPersonalEvent} disabled={!newEvent.title.trim()}>
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calendar Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Select value={selectedView} onValueChange={setSelectedView}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-0">
              {selectedView === 'week' && (
                <div className="grid grid-cols-8 min-h-96">
                  {/* Time column */}
                  <div className="border-r border-border">
                    <div className="h-12 border-b border-border"></div>
                    {hours.slice(8, 20).map((hour) => (
                      <div key={hour} className="h-16 border-b border-border p-2 text-xs text-muted-foreground">
                        {hour}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {days.map((day, index) => {
                    const currentWeekDate = new Date(currentDate);
                    currentWeekDate.setDate(currentWeekDate.getDate() - currentWeekDate.getDay() + 1 + index);

                    return (
                      <div key={day} className="border-r border-border last:border-r-0">
                        <div className="h-12 border-b border-border p-2 text-center font-medium">
                          <div className="text-sm">{day}</div>
                          <div className="text-lg">{currentWeekDate.getDate()}</div>
                        </div>

                        {/* Time slots */}
                        <div className="relative">
                          {hours.slice(8, 20).map((hour) => (
                            <div key={hour} className="h-16 border-b border-border hover:bg-muted/20 transition-colors" />
                          ))}

                          {/* Events overlay */}
                          {getEventsForDate(currentWeekDate).map((event, eventIndex) => {
                            const startHour = parseInt(event.start_time.split(':')[0]);
                            const topPosition = (startHour - 8) * 64 + 16;

                            return (
                              <div
                                key={event.id}
                                className="absolute left-1 right-1 p-1"
                                style={{ top: `${topPosition}px` }}
                              >
                                <div
                                  className={`p-2 rounded text-xs border cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                                  onClick={() => handleEventClick(event)}
                                >
                                  <div className="font-medium truncate">
                                    {event.type === 'lesson' ? event.subject : event.title}
                                  </div>
                                  <div className="opacity-80">{formatTime(event.start_time)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedView === 'month' && (
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {days.map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isCurrentDay = isToday(day);
                      const dayEvents = getEventsForDate(day);

                      return (
                        <div
                          key={index}
                          className={`aspect-square border border-border p-2 hover:bg-muted/20 transition-colors cursor-pointer flex flex-col ${!isCurrentMonth ? 'text-muted-foreground/40' : ''
                            }`}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className={`text-sm font-medium ${isCurrentDay
                              ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                              : ''
                            }`}>
                            {format(day, 'd')}
                          </div>

                          {/* Events indicators */}
                          <div className="flex-1 overflow-hidden mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate border cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                                title={event.type === 'lesson' ? `${event.subject} with ${event.tutorName}` : event.title}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                              >
                                {formatTime(event.start_time)} - {event.type === 'lesson' ? event.subject : event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div
                                className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayClick(day);
                                }}
                              >
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events Modal */}
          {selectedDateEvents.length > 0 && (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    Events on {format(selectedDate!, 'MMMM d, yyyy')}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDateEvents([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                    onClick={() => {
                      setSelectedEvent(event);
                      setSelectedDateEvents([]);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {event.type === 'lesson' ? `${event.subject} Lesson` :
                            event.type === 'personal' ? event.title : event.title}
                        </h4>
                        <p className="text-xs opacity-80 mt-1">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </p>
                        <p className="text-xs opacity-80">
                          {event.type === 'lesson' ? `Tutor: ${event.tutorName}` :
                            event.type === 'personal' ? 'Personal Event' : event.presenter}
                        </p>
                      </div>
                      {event.type === 'personal' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePersonalEvent(event.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Event Details Modal */}
          {selectedEvent && (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {selectedEvent.type === 'lesson' ? `${selectedEvent.subject} Lesson` :
                      selectedEvent.type === 'personal' ? selectedEvent.title : selectedEvent.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {selectedEvent.type === 'lesson'
                    ? `Tutor: ${selectedEvent.tutorName}`
                    : selectedEvent.type === 'personal'
                      ? 'Personal Event'
                      : `Presented by ${selectedEvent.presenter}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(selectedEvent.date)}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {selectedEvent.location}
                  </div>
                  {selectedEvent.type === 'lesson' && (
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Subject: {selectedEvent.subject}
                    </div>
                  )}
                  {selectedEvent.type === 'personal' && selectedEvent.description && (
                    <div className="text-muted-foreground mt-2">
                      {selectedEvent.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {isPastEvent(selectedEvent) ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      Past {selectedEvent.type === 'lesson' ? 'Lesson' : 'Event'}
                    </Badge>
                  ) : selectedEvent.type === 'lesson' ? (
                    <Badge variant="default" className="bg-orange-100 text-orange-800">
                      Scheduled Lesson
                    </Badge>
                  ) : selectedEvent.type === 'personal' ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Personal Event
                    </Badge>
                  ) : isRegistered(selectedEvent.id) ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Registered
                    </Badge>
                  ) : (
                    <Badge variant="outline">Available</Badge>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {/* Only show register button for events, not lessons or personal events */}
                  {!isPastEvent(selectedEvent) && selectedEvent.type === 'event' && (
                    <Button
                      className={`w-full ${isRegistered(selectedEvent.id)
                          ? 'bg-destructive hover:bg-destructive/90'
                          : 'bg-gradient-primary hover:opacity-90'
                        }`}
                      onClick={() =>
                        isRegistered(selectedEvent.id)
                          ? handleUnregister(selectedEvent.id)
                          : handleRegister(selectedEvent.id)
                      }
                      disabled={registerLoading === selectedEvent.id}
                    >
                      {registerLoading === selectedEvent.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isRegistered(selectedEvent.id) ? (
                        'Unregister'
                      ) : (
                        'Register for Event'
                      )}
                    </Button>
                  )}

                  {/* Delete button for personal events */}
                  {selectedEvent.type === 'personal' && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleDeletePersonalEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                    >
                      Delete Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events & Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events or lessons
                </p>
              ) : (
                upcomingEvents.map((event) => {
                  const IconComponent = getEventIcon(event);
                  const registered = isRegistered(event.id);
                  const pastEvent = isPastEvent(event);

                  return (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded ${getEventColor(event).split(' ')[0]} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">
                              {event.type === 'lesson' ? `${event.subject} Lesson` :
                                event.type === 'personal' ? event.title : event.title}
                            </h4>
                            {event.type === 'lesson' ? (
                              <Badge variant="default" className="bg-orange-100 text-orange-800 text-xs">
                                Lesson
                              </Badge>
                            ) : event.type === 'personal' ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                                Personal
                              </Badge>
                            ) : registered && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Registered
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {event.type === 'lesson' ? event.tutorName :
                              event.type === 'personal' ? 'Personal Event' : event.presenter}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(parseISO(event.date), 'MMM d')} • {formatTime(event.start_time)}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}