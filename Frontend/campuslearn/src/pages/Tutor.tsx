import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, MessageSquare, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RecentMessage {
  id: string;
  senderId: number;
  content: string;
  timestamp: string;
  threadId: string;
  senderName?: string;
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

export default function Tutor() {
  const { user } = useAuth();
  const [tutorID, setTutorID] = useState('');
  const [tutorSessions, setTutorSessions] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<'upcoming' | 'recent'>('upcoming');
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [pendingSessions, setPendingSessions] = useState(0);

  // New filtering states
  const [filterStatus, setFilterStatus] = useState<'all' | 'accepted' | 'pending' | 'completed'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'thisWeek' | 'future'>('all');

  const navigate = useNavigate();
  const currentStudentId = user?.id ? parseInt(user.id) : null;

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

  // Fetch recent messages
  const fetchRecentMessages = async () => {
    if (!currentStudentId) return;

    try {
      const token = localStorage.getItem('authToken');

      const threadRes = await fetch(
        `http://localhost:9090/messaging/threads/student/${currentStudentId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!threadRes.ok) throw new Error('Failed to fetch threads');
      const threads: MessageThreadDTO[] = await threadRes.json();

      const messagesPerThread = await Promise.all(
        threads.map(async (thread) => {
          const msgRes = await fetch(
            `http://localhost:9090/messaging/messages/thread/${thread.threadId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (!msgRes.ok) return [];
          return await msgRes.json();
        })
      );

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const allMessages: RecentMessage[] = (
        await Promise.all(
          messagesPerThread.flat()
            .filter(msg => msg.senderId !== currentStudentId)
            .map(async (msg) => ({
              ...msg,
              senderName: await fetchUserName(msg.senderId),
            }))
        )
      )
        .filter(msg => new Date(msg.timestamp) >= threeDaysAgo)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentMessages(allMessages);
    } catch (err) {
      console.error('Error fetching recent messages:', err);
      setRecentMessages([]);
    }
  };

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:9090/tutors/student/${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const tutorData = await response.json();
        const fetchedTutorID = tutorData.id;
        setTutorID(fetchedTutorID);

        if (fetchedTutorID) {
          const response2 = await fetch(`http://localhost:9090/api/bookings/tutor/${fetchedTutorID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          const sessionsData = await response2.json();
          setTutorSessions(sessionsData);

          // Total Students
          const uniqueStudents = new Set(sessionsData.map((s: any) => s.studentId));
          setTotalStudents(uniqueStudents.size);

          // Upcoming Approved Sessions
          const now = new Date();
          const upcomingSessionsCount = sessionsData.filter((s: any) => {
            const sessionDate = new Date(s.startDatetime);
            return s.status === 'accepted' && sessionDate > now; // Only future approved sessions
          }).length;
          setSessionsThisWeek(upcomingSessionsCount);

          // Pending Sessions
          const pendingCount = sessionsData.filter((s: any) => s.status === 'pending').length;
          setPendingSessions(pendingCount);
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      }
    };

    fetchTutorData();
    fetchRecentMessages();
  }, [user?.id]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:9090/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setTutorSessions((prev) => {
        const updated = prev.map((session) =>
          session.id === bookingId ? { ...session, status } : session
        );

        // Recompute stats immediately
        const now = new Date();
        const upcomingCount = updated.filter(
          (s) => s.status === 'accepted' && new Date(s.startDatetime) > now
        ).length;
        setSessionsThisWeek(upcomingCount);

        const pendingCount = updated.filter((s) => s.status === 'pending').length;
        setPendingSessions(pendingCount);

        const uniqueStudents = new Set(updated.map((s) => s.studentId));
        setTotalStudents(uniqueStudents.size);

        return updated;
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Subjects for filter dropdown
  const subjects = Array.from(new Set(tutorSessions.map(s => s.subject))).filter(Boolean);

  // Filter and sort sessions
  const filteredAndSortedSessions = [...tutorSessions]
    .filter(s => s.status !== 'declined')
    .filter(s => filterStatus === 'all' ? true : s.status === filterStatus)
    .filter(s => filterSubject === 'all' ? true : s.subject === filterSubject)
    .filter(s => {
      const now = new Date();
      const start = new Date(s.startDatetime);
      if (filterDate === 'today') return start.toDateString() === now.toDateString();
      if (filterDate === 'thisWeek') {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (7 - now.getDay()));
        return start >= now && start <= weekEnd;
      }
      if (filterDate === 'future') return start > now;
      return true; // 'all'
    })
    .sort((a, b) => {
      const aTime = new Date(a.startDatetime).getTime();
      const bTime = new Date(b.startDatetime).getTime();
      return sortOrder === 'upcoming' ? aTime - bTime : bTime - aTime;
    });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-hero rounded-xl p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="text-white/80 text-base md:text-lg">Ready to inspire and educate your students?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Upcomming Approved Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsThisWeek}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval Lessons</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSessions}</div>
          </CardContent>
        </Card>

      </div>

      {/* Upcoming Sessions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Upcoming Sessions</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortOrder === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={sortOrder === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('recent')}
              >
                Recent
              </Button>

              {/* Status Filter */}
              <select
                className="border rounded px-2 py-1 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              {/* Subject Filter */}
              <select
                className="border rounded px-2 py-1 text-sm"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                className="border rounded px-2 py-1 text-sm"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as any)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="future">Future</option>
              </select>
            </div>
          </CardHeader>
          <CardDescription className="ml-7 pb-4">Your scheduled tutoring sessions</CardDescription>
          <CardContent className="space-y-4">
            {filteredAndSortedSessions.length > 0 ? (
              <>
                {filteredAndSortedSessions.slice(0, showAll ? undefined : 4).map((session) => {
                  const start = new Date(session.startDatetime);
                  const end = new Date(session.endDatetime);

                  const formattedDate = start.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  });
                  const formattedTime = start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  const durationMs = end.getTime() - start.getTime();
                  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                  let durationString = '';
                  if (durationHours > 0) durationString += `${durationHours}h`;
                  if (durationMinutes > 0) durationString += `${durationHours > 0 ? ' ' : ''}${durationMinutes}m`;
                  if (!durationString) durationString = '1h';

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{session.studentName}</p>
                        <p className="text-sm text-muted-foreground">{session.subject}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          <Clock className="inline-block mr-1 h-4 w-4" />
                          {formattedTime}, {formattedDate}
                        </p>
                        <p className="text-xs text-muted-foreground">Duration: {durationString}</p>

                        {session.status === 'pending' && (
                          <div className="flex gap-2 justify-end mt-2">
                            <Button
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => handleUpdateStatus(session.id, 'accepted')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUpdateStatus(session.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {session.status !== 'pending' && (
                          <>
                            <Badge
                              className={`${session.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : session.status === 'cancelled'
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-red-100 text-red-800'
                                } pointer-events-none`}
                            >
                              {session.status.toUpperCase()}
                            </Badge>

                            {session.status === 'accepted' && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="hover:bg-red-700"
                                  onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                                >
                                  Cancel Booking
                                </Button>

                                <Button
                                  size="sm"
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                  onClick={() => handleUpdateStatus(session.id, 'completed')}
                                >
                                  Mark as Completed
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredAndSortedSessions.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? 'View Less' : 'View More'}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

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
            <Button variant="outline" className="p-6 h-auto flex-col" onClick={() => navigate("/tutor/content")}>
              <BookOpen className="mb-2 h-6 w-6" />
              Create Course Material
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col" onClick={() => navigate("/tutor/students")}>
              <Users className="mb-2 h-6 w-6" />
              Manage Students
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col" onClick={() => navigate("/Set-Availability")}>
              <Calendar className="mb-2 h-6 w-6" />
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
