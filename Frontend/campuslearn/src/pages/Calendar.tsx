import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  Video,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month');

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const events = [
    {
      id: 1,
      title: 'Mathematics Tutoring',
      tutor: 'Dr. Sarah Wilson',
      time: '2:00 PM - 3:00 PM',
      date: '2023-11-20',
      location: 'Library Room 203',
      type: 'tutoring',
      color: 'bg-primary',
      attendees: 1
    },
    {
      id: 2,
      title: 'CS Study Group',
      tutor: 'Study Group',
      time: '4:00 PM - 6:00 PM',
      date: '2023-11-20',
      location: 'Computer Lab',
      type: 'study-group',
      color: 'bg-secondary',
      attendees: 6
    },
    {
      id: 3,
      title: 'Physics Lab Session',
      tutor: 'Prof. Johnson',
      time: '10:00 AM - 12:00 PM',
      date: '2023-11-21',
      location: 'Physics Lab 101',
      type: 'laboratory',
      color: 'bg-success',
      attendees: 12
    },
    {
      id: 4,
      title: 'Chemistry Review',
      tutor: 'Dr. Emma Rodriguez',
      time: '1:00 PM - 2:30 PM',
      date: '2023-11-22',
      location: 'Virtual Meeting',
      type: 'review',
      color: 'bg-warning',
      attendees: 8
    },
  ];

  const upcomingEvents = events.slice(0, 3);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const calendarDays = getCalendarDays();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tutoring':
        return BookOpen;
      case 'study-group':
        return Users;
      case 'laboratory':
        return CalendarIcon;
      case 'review':
        return Video;
      default:
        return CalendarIcon;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Events</h1>
          <p className="text-muted-foreground">Manage your study schedule and sessions</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
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
                  {days.map((day, index) => (
                    <div key={day} className="border-r border-border last:border-r-0">
                      <div className="h-12 border-b border-border p-2 text-center font-medium">
                        <div className="text-sm">{day}</div>
                        <div className="text-lg">{17 + index}</div>
                      </div>
                      
                      {/* Time slots */}
                      <div className="relative">
                        {hours.slice(8, 20).map((hour) => (
                          <div key={hour} className="h-16 border-b border-border hover:bg-muted/20 transition-colors" />
                        ))}
                        
                        {/* Events overlay */}
                        {index === 0 && (
                          <div className="absolute top-16 left-1 right-1 p-1">
                            <div className="bg-primary text-primary-foreground p-2 rounded text-xs">
                              <div className="font-medium">Math Tutoring</div>
                              <div className="opacity-80">2:00 PM</div>
                            </div>
                          </div>
                        )}
                        
                        {index === 0 && (
                          <div className="absolute top-32 left-1 right-1 p-1">
                            <div className="bg-secondary text-secondary-foreground p-2 rounded text-xs">
                              <div className="font-medium">CS Study Group</div>
                              <div className="opacity-80">4:00 PM</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                      
                      return (
                        <div 
                          key={index} 
                          className={`aspect-square border border-border p-2 hover:bg-muted/20 transition-colors cursor-pointer flex flex-col ${
                            !isCurrentMonth ? 'text-muted-foreground/40' : ''
                          }`}
                        >
                          <div className={`text-sm font-medium ${
                            isCurrentDay 
                              ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' 
                              : ''
                          }`}>
                            {format(day, 'd')}
                          </div>
                          {/* Mock events for demonstration */}
                          {isCurrentMonth && format(day, 'd') === '20' && (
                            <div className="bg-primary w-2 h-2 rounded-full mt-1"></div>
                          )}
                          {isCurrentMonth && format(day, 'd') === '22' && (
                            <div className="bg-secondary w-2 h-2 rounded-full mt-1"></div>
                          )}
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
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded ${event.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.tutor}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Event Types Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="text-sm">Tutoring Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-secondary"></div>
                <span className="text-sm">Study Groups</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-success"></div>
                <span className="text-sm">Laboratory</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-warning"></div>
                <span className="text-sm">Review Sessions</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Schedule Tutoring
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Users className="mr-2 h-4 w-4" />
                Join Study Group
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Video className="mr-2 h-4 w-4" />
                Book Review Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}