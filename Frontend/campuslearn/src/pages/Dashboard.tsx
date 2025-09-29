import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Active Courses', value: '8', icon: BookOpen, color: 'text-primary' },
    { label: 'Study Sessions', value: '24', icon: Clock, color: 'text-secondary' },
    { label: 'Forum Posts', value: '156', icon: MessageSquare, color: 'text-success' },
    { label: 'Tutoring Hours', value: '42', icon: Users, color: 'text-warning' },
  ];

  const recentCourses = [
    { name: 'Advanced Mathematics', tutor: 'Dr. Sarah Wilson', progress: 78, nextSession: '2:00 PM Today' },
    { name: 'Computer Science 101', tutor: 'Prof. Mike Chen', progress: 92, nextSession: '10:00 AM Tomorrow' },
    { name: 'Physics Fundamentals', tutor: 'Dr. Emma Rodriguez', progress: 65, nextSession: '3:30 PM Friday' },
  ];

  const upcomingEvents = [
    { title: 'Math Study Group', time: '2:00 PM', date: 'Today', type: 'Study Session' },
    { title: 'CS Project Deadline', time: '11:59 PM', date: 'Tomorrow', type: 'Assignment' },
    { title: 'Physics Lab', time: '9:00 AM', date: 'Friday', type: 'Laboratory' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero rounded-xl p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-white/80 text-base md:text-lg">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-custom-md transition-shadow">
              <CardContent className="flex flex-col md:flex-row items-center p-3 md:p-6">
                <div className={`p-2 rounded-lg bg-muted mb-2 md:mb-0 md:mr-4`}>
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Recent Courses
            </CardTitle>
            <CardDescription>Your active learning sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((course, index) => (
              <div key={index} className="p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{course.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">with {course.tutor}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                    {course.progress}%
                  </Badge>
                </div>
                <Progress value={course.progress} className="mb-2" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm space-y-1 sm:space-y-0">
                  <span className="text-muted-foreground">Next: {course.nextSession}</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 self-start sm:self-auto">
                    Continue <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-1 sm:space-y-0">
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base">{event.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">{event.time} • {event.date}</p>
                </div>
                <Badge variant="outline" className="text-xs self-start sm:self-auto">
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to your most-used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Find Tutor</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Join Forum</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2">
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}