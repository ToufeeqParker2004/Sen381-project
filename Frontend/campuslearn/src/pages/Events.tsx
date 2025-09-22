import React, { useState } from 'react';
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
} from 'lucide-react';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Advanced Calculus Workshop',
      description: 'Interactive workshop covering advanced calculus concepts',
      organizer: 'Dr. Sarah Wilson',
      rating: 4.9,
      attendees: 24,
      price: 25,
      duration: '3hr',
      subject: 'Mathematics',
      level: 'Advanced',
      date: 'March 15, 2024',
      time: '2:00 PM',
      location: 'Math Building, Room 201'
    },
    {
      id: 2,
      title: 'Data Structures Bootcamp',
      description: 'Intensive hands-on coding bootcamp for CS students',
      organizer: 'Prof. Mike Chen',
      rating: 4.8,
      attendees: 18,
      price: 35,
      duration: '4hr',
      subject: 'Computer Science',
      level: 'Intermediate',
      date: 'March 18, 2024',
      time: '10:00 AM',
      location: 'CS Building, Lab 3'
    },
    {
      id: 3,
      title: 'Organic Chemistry Lab Session',
      description: 'Practical lab work and theory review',
      organizer: 'Dr. Emma Rodriguez',
      rating: 4.7,
      attendees: 12,
      price: 30,
      duration: '2hr',
      subject: 'Chemistry',
      level: 'Intermediate',
      date: 'March 20, 2024',
      time: '1:00 PM',
      location: 'Science Lab, Room 105'
    },
  ];

  // Filter events based on search and subject
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || 
      event.subject.toLowerCase().replace(' ', '-') === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground">Discover upcoming academic events and workshops</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events, subjects, or organizers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-custom-lg transition-shadow">
            <div className="aspect-video bg-gradient-subtle rounded-t-lg flex items-center justify-center">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">{event.description}</CardDescription>
                </div>
                <Badge variant="secondary">{event.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-3 w-3" />
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-3 w-3" />
                  {event.location}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="mr-1 h-3 w-3 fill-current text-warning" />
                  {event.rating}
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  {event.attendees} attending
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {event.duration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  by {event.organizer}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1 bg-gradient-primary hover:opacity-90">Register</Button>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}