import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<any[]>([]);

  const stats = [
    { label: 'Active Courses', value: '8', icon: BookOpen, color: 'text-primary' },
    { label: 'Study Sessions', value: '24', icon: Clock, color: 'text-secondary' },
    { label: 'Forum Posts', value: '156', icon: MessageSquare, color: 'text-success' },
    { label: 'Tutoring Hours', value: '42', icon: Users, color: 'text-warning' },
  ];

  const recentMessages = [
    { name: 'Dr. Sarah Wilson', message: 'Great progress on your calculus homework!', time: '2 hours ago', unread: true },
    { name: 'Prof. Mike Chen', message: 'Don\'t forget about the project deadline tomorrow', time: '4 hours ago', unread: false },
    { name: 'Study Group Chat', message: 'Meeting at 3 PM in the library today', time: '6 hours ago', unread: true },
  ];

  const upcomingEvents = [
    { title: 'Math Study Group', time: '2:00 PM', date: 'Today', type: 'Study Session' },
    { title: 'CS Project Deadline', time: '11:59 PM', date: 'Tomorrow', type: 'Assignment' },
    { title: 'Physics Lab', time: '9:00 AM', date: 'Friday', type: 'Laboratory' },
  ];

  useEffect(() => {
  // Fetch tutor/student name based on tutorId
  const fetchTutorStudentDetails = async (tutorId: number): Promise<string> => {
    try {
      const res = await fetch(`http://localhost:9090/student/by-tutor/${tutorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch student for tutor ${tutorId}`);
      const student = await res.json();

      // Use the 'name' column directly from your database
      return student.name || 'Unknown Tutor';
    } catch (error) {
      console.error('Error fetching tutor student details:', error);
      return 'Unknown Tutor';
    }
  };

  // Fetch lessons for the current student
  const fetchStudentLessons = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:9090/api/bookings/student/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch lessons');

      const data = await response.json();
      console.log('Fetched Lessons:', data);

      // Add tutorName to each lesson
      const lessonsWithTutorNames = await Promise.all(
        data.map(async (lesson: any) => {
          const tutorName = await fetchTutorStudentDetails(lesson.tutorId);
          return { ...lesson, tutorName };
        })
      );

      // Sort by startDatetime
      const sortedLessons = lessonsWithTutorNames.sort(
        (a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime()
      );

      setLessons(sortedLessons);
    } catch (error) {
      console.error('Error fetching student lessons:', error);
    }
  };

  fetchStudentLessons();
}, [user?.id]);


  const formatDateTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateStr = startDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return { dateStr, timeStr };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero rounded-xl p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-white/80 text-base md:text-lg">
          Ready to continue your learning journey?
        </p>
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
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>Your latest conversations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.map((message, index) => (
              <div
                key={index}
                className="p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm md:text-base">{message.name}</h4>
                      {message.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground self-start sm:self-auto">
                    {message.time}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="h-auto p-0">
                    Reply <ChevronRight className="ml-1 h-3 w-3" />
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
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-1 sm:space-y-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base">{event.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {event.time} • {event.date}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs self-start sm:self-auto">
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/*Upcoming Lessons (Real Data) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Upcoming Lessons
          </CardTitle>
          <CardDescription>Your scheduled lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => {
              const { dateStr, timeStr } = formatDateTime(lesson.startDatetime, lesson.endDatetime);
              return (
                <div
                  key={lesson.id || index}
                  className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-1 sm:space-y-0"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{lesson.subject}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <User className="inline-block h-3 w-3 mr-1" /> {lesson.tutorName} • {dateStr} • {timeStr}
                      </p>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs self-start sm:self-auto ${lesson.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : lesson.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {lesson.status.toUpperCase()}
                  </Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No upcoming lessons found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to your most-used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2" onClick={() => navigate('/tutors')}>
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Find Tutor</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2" onClick={() => navigate('/forum')}>
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Join Forum</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2" onClick={() => navigate('/calendar')}>
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2" onClick={() => navigate('/progress')}>
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
