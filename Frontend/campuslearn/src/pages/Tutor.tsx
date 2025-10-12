import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, MessageSquare, DollarSign, Star, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Tutor() {
  const { user } = useAuth();
  const [tutorID, setTutorID] = useState('');
  const [tutorSessions, setTutorSessions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<'upcoming' | 'recent'>('upcoming');

  const mockStats = {
    totalStudents: 24,
    sessionsThisWeek: 8,
    averageRating: 4.8,
    totalEarnings: 1250,
  };

  const recentMessages = [
    { id: 1, student: 'Alice Johnson', message: 'Can we reschedule our session?', time: '2 hours ago' },
    { id: 2, student: 'David Wilson', message: 'Thank you for the help with calculus!', time: '5 hours ago' },
    { id: 3, student: 'Emma Brown', message: 'Could you send me the practice problems?', time: '1 day ago' },
  ];

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:9090/tutors/student/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const tutorData = await response.json();
        const fetchedTutorID = tutorData.id;
        setTutorID(fetchedTutorID);

        if (fetchedTutorID) {
          const response2 = await fetch(`http://localhost:9090/api/bookings/tutor/${fetchedTutorID}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          const sessionsData = await response2.json();
          setTutorSessions(sessionsData);
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      }
    };

    fetchTutorData();
  }, [user?.id]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:9090/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setTutorSessions((prev) =>
        prev.map((session) => (session.id === bookingId ? { ...session, status } : session))
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const filteredSessions = tutorSessions.filter((s) => s.status !== 'declined');

  const sortedSessions = [...filteredSessions].sort((a, b) => {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.sessionsThisWeek}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-warning fill-current" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageRating}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-custom-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalEarnings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Upcoming Sessions</CardTitle>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </CardHeader>
          <CardDescription className="ml-7 pb-4">Your scheduled tutoring sessions</CardDescription>
          <CardContent className="space-y-4">
            {sortedSessions.length > 0 ? (
              <>
                {sortedSessions.slice(0, showAll ? undefined : 4).map((session) => {
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

                        {/* Added cancel button for accepted bookings */}
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

                                {/* New button for Completed */}
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

                {sortedSessions.length > 5 && (
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
            <CardDescription>Messages from your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="space-y-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{message.student}</p>
                  <p className="text-xs text-muted-foreground">{message.time}</p>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
              </div>
            ))}
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
    </div>
  );
}
