import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, MessageSquare, Clock, TrendingUp, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

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
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-black-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
                  <CardDescription className="mt-1">Your scheduled tutoring sessions</CardDescription>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={sortOrder === 'upcoming' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSortOrder('upcoming')}
                    className="flex items-center gap-1 rounded-r-none border-0"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Upcoming
                  </Button>
                  <Button
                    variant={sortOrder === 'recent' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSortOrder('recent')}
                    className="flex items-center gap-1 rounded-l-none border-0"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Recent
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="all">All Status</option>
                      <option value="accepted">Accepted</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value as any)}
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="future">Future</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterSubject('all');
                      setFilterDate('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {filteredAndSortedSessions.length > 0 ? (
              <>
                <div className="space-y-3">
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

                    const isUpcoming = new Date(session.startDatetime) > new Date();

                    return (
                      <div
                        key={session.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{session.studentName}</h3>
                                <p className="text-sm text-gray-600 mt-1">{session.subject}</p>
                              </div>
                              <Badge 
                                variant={getStatusVariant(session.status)}
                                className="ml-2"
                              >
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formattedTime}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration: {durationString}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              {session.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleUpdateStatus(session.id, 'accepted')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => handleUpdateStatus(session.id, 'declined')}
                                  >
                                    Decline
                                  </Button>
                                </>
                              )}

                              {session.status === 'accepted' && isUpcoming && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleUpdateStatus(session.id, 'completed')}
                                  >
                                    Mark Complete
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                                  >
                                    Cancel Session
                                  </Button>
                                </>
                              )}

                              {session.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-200 text-green-700"
                                  disabled
                                >
                                  Completed
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAndSortedSessions.length > 4 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAll((prev) => !prev)}
                      className="w-full max-w-xs"
                    >
                      {showAll ? 'Show Less' : `View All (${filteredAndSortedSessions.length})`}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No sessions found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filterStatus !== 'all' || filterSubject !== 'all' || filterDate !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No upcoming sessions scheduled'}
                </p>
              </div>
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