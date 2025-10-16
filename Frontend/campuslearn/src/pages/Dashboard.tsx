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
  MapPin,
  Mic2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface RecentMessage {
  id: string;
  senderId: number;
  content: string;
  timestamp: string;
  threadId: string;
  senderName?: string; // optional, if you want to show name instead of ID
}

interface MessageDTO {
  id: string;
  senderId: number;
  content: string;
  timestamp: string;
  threadId: string;
}

interface MessageThreadDTO {
  threadId: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const currentStudentId = user?.id ? parseInt(user.id) : null;
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const [lessonFilter, setLessonFilter] = useState<'all' | 'accepted' | 'pending' | 'declined' | 'cancelled' | 'completed'>('all');

  const [stats, setStats] = useState([
    { label: 'Lessons Summary', value: '-', icon: BookOpen, color: 'text-primary' },
    { label: 'Recent Messages', value: '-', icon: MessageSquare, color: 'text-success' },
    { label: 'Registered Events', value: '-', icon: Calendar, color: 'text-secondary' },
    { label: 'Tutors', value: '-', icon: Users, color: 'text-warning' },
  ]);
  const [lessonsStats, setLessonsStats] = useState({
    approved: 0,
    pending: 0,
    declined: 0,
    cancelled: 0,
    completed: 0,
  });

  useEffect(() => {
    const upcomingLessons = lessons.length;
    const recentMsgs = recentMessages.length;
    const registeredEvts = registeredEvents.length;

    // Example: count unique tutors from lessons
    const uniqueTutors = new Set(lessons.map(l => l.tutorId)).size;

    const approved = lessons.filter(l => l.status === 'accepted').length;
    const pending = lessons.filter(l => l.status === 'pending').length;
    const declined = lessons.filter(l => l.status === 'declined').length;
    const cancelled = lessons.filter(l => l.status === 'cancelled').length;
    const completed = lessons.filter(l => l.status === 'completed').length;

    setLessonsStats({ approved, pending, declined, cancelled, completed });

    setStats([
      { label: 'Lessons Summary', value: upcomingLessons.toString(), icon: BookOpen, color: 'text-primary' },
      { label: 'Recent Messages', value: recentMsgs.toString(), icon: MessageSquare, color: 'text-success' },
      { label: 'Registered Events', value: registeredEvts.toString(), icon: Calendar, color: 'text-secondary' },
      { label: 'Tutors', value: uniqueTutors.toString(), icon: Users, color: 'text-warning' },
    ]);

  }, [lessons, recentMessages, registeredEvents]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (start: string, end: string): string =>
    `${start.slice(0, 5)} - ${end.slice(0, 5)}`;

  const fetchUserName = async (userId: number): Promise<string> => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:9090/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      return data.name || `User ${userId}`;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      return `User ${userId}`;
    }
  };

  // Fetch recent messages for current student
  const fetchRecentMessages = async () => {
    if (!currentStudentId) return;

    try {
      const token = localStorage.getItem('authToken');

      // Get all threads for the student
      const threadRes = await fetch(
        `http://localhost:9090/messaging/threads/student/${currentStudentId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!threadRes.ok) throw new Error('Failed to fetch threads');
      const threads: MessageThreadDTO[] = await threadRes.json();

      // Fetch messages for each thread
      const messagesPerThread = await Promise.all(
        threads.map(async (thread) => {
          const msgRes = await fetch(
            `http://localhost:9090/messaging/messages/thread/${thread.threadId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (!msgRes.ok) return [];
          const msgs: MessageDTO[] = await msgRes.json();
          return msgs;
        })
      );

      // Flatten and filter last 3 days AND only messages sent to current user
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      let allMessages: RecentMessage[] = (await Promise.all(
        messagesPerThread.flat()
          .filter(msg => msg.senderId !== currentStudentId) // <-- filter out messages sent by me
          .map(async (msg) => {
            const senderName = await fetchUserName(msg.senderId); // fetch sender name
            return { ...msg, senderName };
          })
      ))
        .filter(msg => new Date(msg.timestamp) >= threeDaysAgo)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentMessages(allMessages);
    } catch (err) {
      console.error('Error fetching recent messages:', err);
      setRecentMessages([]);
    }
  };

  // Fetch registered events for current student
  const fetchRegisteredEvents = async (): Promise<void> => {
    if (!currentStudentId) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:9090/student-events/student/${currentStudentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch registered events');
      const data: Event[] = await response.json();

      // Sort by event date ascending
      const sorted = data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setRegisteredEvents(sorted);
      console.log('Registered Events:', sorted);
    } catch (err) {
      console.error('Error fetching registered events:', err);
      setRegisteredEvents([]);
    }
  };

  // Fetch student lessons
  useEffect(() => {
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
        return student.name || 'Unknown Tutor';
      } catch (error) {
        console.error('Error fetching tutor student details:', error);
        return 'Unknown Tutor';
      }
    };

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

        const lessonsWithTutorNames = await Promise.all(
          data.map(async (lesson: any) => {
            const tutorName = await fetchTutorStudentDetails(lesson.tutorId);
            return { ...lesson, tutorName };
          })
        );

        const sortedLessons = lessonsWithTutorNames.sort(
          (a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime()
        );

        setLessons(sortedLessons);
      } catch (error) {
        console.error('Error fetching student lessons:', error);
      }
    };

    fetchStudentLessons();
    fetchRegisteredEvents();
    fetchRecentMessages();
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

  const filteredLessons = lessons.filter((lesson) =>
    lessonFilter === 'all' ? true : lesson.status === lessonFilter
  );

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
          const isHovered = hoveredStat === stat.label;

          return (
            <Card
              key={stat.label}
              className="relative hover:shadow-custom-md transition-shadow"
              onMouseEnter={() => setHoveredStat(stat.label)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <CardContent className="flex flex-col md:flex-row items-center p-3 md:p-6">
                <div className={`p-2 rounded-lg bg-muted mb-2 md:mb-0 md:mr-4`}>
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{stat.label}</p>

                  {/* Hover stats popup */}
                  {stat.label === 'Lessons Summary' && isHovered && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-10 text-sm text-gray-700">
                      <p>Approved: {lessonsStats.approved}</p>
                      <p>Pending: {lessonsStats.pending}</p>
                      <p>Declined: {lessonsStats.declined}</p>
                      <p>Cancelled: {lessonsStats.cancelled}</p>
                      <p>Completed: {lessonsStats.completed}</p>
                    </div>
                  )}
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
            <CardDescription>Your latest messages (past 3 days)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length > 0 ? (
              <>
                {(showAllMessages ? recentMessages : recentMessages.slice(0, 4)).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">
                          {msg.senderName || `User ${msg.senderId}`}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {msg.content}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground self-start sm:self-auto">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => navigate('/messages')}>
                        Reply <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {recentMessages.length > 4 && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-muted transition-colors"
                      onClick={() => setShowAllMessages((prev) => !prev)}
                    >
                      {showAllMessages ? 'View Less' : 'View More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                No messages in the past 3 days
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Registered Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Registered Events
            </CardTitle>
            <CardDescription>Events you've signed up for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registeredEvents.length > 0 ? (
              <>
                {(showAllEvents ? registeredEvents : registeredEvents.slice(0, 4)).map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm md:text-base text-foreground">
                        {event.title}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <Calendar className="inline-block h-3 w-3 mr-1" />{' '}
                        {formatDate(event.date)} • {formatTime(event.start_time, event.end_time)}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <MapPin className="inline-block h-3 w-3 mr-1" />{' '}
                        {event.location || 'TBA'}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <Mic2 className="inline-block h-3 w-3 mr-1" />{' '}
                        {event.presenter || 'Unknown Presenter'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      {event.tutor_id ? 'Tutor-Led' : 'Open Event'}
                    </Badge>
                  </div>
                ))}

                {registeredEvents.length > 4 && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-muted transition-colors"
                      onClick={() => setShowAllEvents((prev) => !prev)}
                    >
                      {showAllEvents ? 'View Less' : 'View More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                No registered events found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Upcoming Lessons
          </CardTitle>
          <CardDescription>Your scheduled lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'accepted', 'pending', 'declined', 'cancelled', 'completed'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={lessonFilter === status ? 'default' : 'outline'}
                onClick={() => setLessonFilter(status as typeof lessonFilter)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : status}
              </Button>
            ))}
          </div>

          {/* Lessons List */}
          {filteredLessons.length > 0 ? (
            <>
              {(showAllLessons ? filteredLessons : filteredLessons.slice(0, 4)).map((lesson, index) => {
                const { dateStr, timeStr } = formatDateTime(lesson.startDatetime, lesson.endDatetime);
                return (
                  <div
                    key={lesson.id || index}
                    className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-1 sm:space-y-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm md:text-base">{lesson.subject}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <User className="inline-block h-3 w-3 mr-1" /> {lesson.tutorName} • <b>{dateStr}</b> • {timeStr}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs self-start sm:self-auto ${lesson.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : lesson.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lesson.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {lesson.status.toUpperCase()}
                    </Badge>

                  </div>
                );
              })}

              {filteredLessons.length > 4 && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-muted transition-colors"
                    onClick={() => setShowAllLessons((prev) => !prev)}
                  >
                    {showAllLessons ? 'View Less' : 'View More'}
                  </Button>
                </div>
              )}
            </>
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
            <Button variant="outline" className="h-16 md:h-20 flex-col space-y-1 md:space-y-2" onClick={() => navigate('/student-progress')}>
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-xs md:text-sm">Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
