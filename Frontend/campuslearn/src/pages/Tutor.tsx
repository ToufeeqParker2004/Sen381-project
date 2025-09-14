import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, MessageSquare, DollarSign, Star, Clock, TrendingUp } from 'lucide-react';
export default function Tutor() {
  const mockStats = {
    totalStudents: 24,
    sessionsThisWeek: 8,
    averageRating: 4.8,
    totalEarnings: 1250
  };
  const upcomingSessions = [{
    id: 1,
    student: 'Alice Johnson',
    subject: 'Mathematics',
    time: '10:00 AM',
    date: 'Today'
  }, {
    id: 2,
    student: 'Bob Smith',
    subject: 'Physics',
    time: '2:00 PM',
    date: 'Tomorrow'
  }, {
    id: 3,
    student: 'Carol Davis',
    subject: 'Chemistry',
    time: '4:00 PM',
    date: 'Dec 12'
  }];
  const recentMessages = [{
    id: 1,
    student: 'Alice Johnson',
    message: 'Can we reschedule our session?',
    time: '2 hours ago'
  }, {
    id: 2,
    student: 'David Wilson',
    message: 'Thank you for the help with calculus!',
    time: '5 hours ago'
  }, {
    id: 3,
    student: 'Emma Brown',
    message: 'Could you send me the practice problems?',
    time: '1 day ago'
  }];
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Manage your tutoring sessions and track your progress</p>
        </div>
        <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.sessionsThisWeek}</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">+0.1 from last month</p>
          </CardContent>
        </Card>

        
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your scheduled tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.map(session => <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">{session.student}</p>
                  <p className="text-sm text-muted-foreground">{session.subject}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline">{session.date}</Badge>
                  <p className="text-sm text-muted-foreground">{session.time}</p>
                </div>
              </div>)}
            <Button variant="outline" className="w-full">
              View All Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>Messages from your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.map(message => <div key={message.id} className="space-y-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{message.student}</p>
                  <p className="text-xs text-muted-foreground">{message.time}</p>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
              </div>)}
            <Button variant="outline" className="w-full">
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="p-6 h-auto flex-col">
              <BookOpen className="mb-2 h-6 w-6" />
              Create Course Material
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col">
              <Users className="mb-2 h-6 w-6" />
              Manage Students
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col">
              <Calendar className="mb-2 h-6 w-6" />
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}