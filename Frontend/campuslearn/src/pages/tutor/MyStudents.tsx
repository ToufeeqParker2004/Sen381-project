import { useState, useEffect, useRef } from 'react';
import {
  Users, Search, Mail, Calendar, TrendingUp, TrendingDown,
  BookOpen, Award, Target, BarChart3, Clock, CheckCircle2,
  Star, Zap, Trophy, Brain, GraduationCap, Lightbulb,
  BookCheck, UserCheck, AlertTriangle, Clock4, Download,
  MessageCircle, FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, PerformanceMetric, StudentGoal, StudentProgress, TutorStats } from '@/types';


export default function MyStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [tutorStats, setTutorStats] = useState<TutorStats>({
    totalStudents: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    averageCompletionRate: 0,
    totalTeachingHours: 0,
    studentEngagement: 0,
    upcomingSessions: 0,
    favoriteSubject: 'N/A'
  });


  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchTutorStudents();
  }, [user?.id]);

  const fetchTutorStudents = async () => {
    if (!user?.id) return;

    try {
      const tutorResponse = await fetch(`http://localhost:9090/tutors/student/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!tutorResponse.ok) throw new Error('Failed to fetch tutor data');
      const tutorData = await tutorResponse.json();

      const bookingsResponse = await fetch(`http://localhost:9090/api/bookings/tutor/${tutorData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!bookingsResponse.ok) throw new Error('Failed to fetch bookings');
      const bookings: Booking[] = await bookingsResponse.json();

      // Create a set of unique student IDs from bookings
      const studentIds = [...new Set(bookings.map(booking => booking.studentId))];

      // Fetch complete student data for each student ID
      const studentPromises = studentIds.map(async (studentId) => {
        try {
          const studentResponse = await fetch(`http://localhost:9090/student/${studentId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (studentResponse.ok) {
            return await studentResponse.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching student ${studentId}:`, error);
          return null;
        }
      });

      const studentDataArray = await Promise.all(studentPromises);
      const studentDataMap = new Map();

      // Create a map of student ID to student data for easy lookup
      studentDataArray.forEach(student => {
        if (student) {
          studentDataMap.set(student.id, student);
        }
      });

      const studentProgressMap = calculateStudentProgress(bookings, studentDataMap);
      const studentProgressArray = Array.from(studentProgressMap.values());

      setStudents(studentProgressArray);
      calculateTutorStats(studentProgressArray, bookings);
      calculatePerformanceMetrics(studentProgressArray);
    } catch (error) {
      console.error('Error fetching tutor students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStudentProgress = (bookings: Booking[], studentDataMap: Map<number, any>): Map<number, StudentProgress> => {
    const studentMap = new Map<number, StudentProgress>();

    bookings.forEach(booking => {
      if (!studentMap.has(booking.studentId)) {
        // Get student data from the map, or use booking data as fallback
        const studentData = studentDataMap.get(booking.studentId);

        studentMap.set(booking.studentId, {
          studentId: booking.studentId,
          studentName: studentData?.name || booking.studentName || 'Unknown Student',
          studentEmail: studentData?.email || booking.studentEmail || 'No email',
          totalLessons: 0,
          completedLessons: 0,
          completionRate: 0,
          totalLearningHours: 0,
          averageSessionLength: 0,
          subjectProgress: [],
          lastActive: new Date(booking.startDatetime).toLocaleDateString(),
          status: 'active',
          streak: 0,
          attendance: 0
        });
      }

      const student = studentMap.get(booking.studentId)!;
      student.totalLessons++;

      if (booking.status === 'completed') {
        student.completedLessons++;

        const start = new Date(booking.startDatetime);
        const end = new Date(booking.endDatetime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        student.totalLearningHours += duration;
      }

      let subjectProgress = student.subjectProgress.find(sp => sp.subject === booking.subject);
      if (!subjectProgress) {
        subjectProgress = {
          subject: booking.subject || 'Unknown Subject',
          lessonsCompleted: 0,
          totalLessons: 0,
          progress: 0
        };
        student.subjectProgress.push(subjectProgress);
      }

      subjectProgress.totalLessons++;
      if (booking.status === 'completed') {
        subjectProgress.lessonsCompleted++;
      }
      subjectProgress.progress = (subjectProgress.lessonsCompleted / subjectProgress.totalLessons) * 100;
    });

    // Calculate additional metrics
    studentMap.forEach(student => {
      student.completionRate = student.totalLessons > 0 ? (student.completedLessons / student.totalLessons) * 100 : 0;
      student.averageSessionLength = student.completedLessons > 0 ? student.totalLearningHours / student.completedLessons : 0;
      student.attendance = student.totalLessons > 0 ? (student.completedLessons / student.totalLessons) * 100 : 0;
      student.streak = calculateStudentStreak(bookings, student.studentId);

      if (student.totalLessons < 3) {
        student.status = 'In-Progress-Student';
      } else if (student.completionRate < 50 || student.streak < 2) {
        student.status = 'not-dedicated';
      } else {
        student.status = 'active';
      }
    });

    return studentMap;
  };

  const calculateStudentStreak = (bookings: Booking[], studentId: number): number => {
    const studentBookings = bookings
      .filter(b => b.studentId === studentId && b.status === 'completed')
      .map(b => new Date(b.startDatetime).toDateString())
      .sort();

    if (studentBookings.length === 0) return 0;

    const uniqueDates = [...new Set(studentBookings)].sort();
    let streak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return streak;
  };

  const calculateTutorStats = (students: StudentProgress[], bookings: Booking[]) => {
    const activeStudents = students.filter(s => s.status === 'active').length;
    const atRiskStudents = students.filter(s => s.status === 'not-dedicated').length;
    const averageCompletionRate = students.length > 0
      ? students.reduce((acc, s) => acc + s.completionRate, 0) / students.length
      : 0;

    const totalTeachingHours = students.reduce((acc, s) => acc + s.totalLearningHours, 0);
    const studentEngagement = students.length > 0
      ? (activeStudents / students.length) * 100
      : 0;

    const upcomingSessions = bookings.filter(b =>
      b.status === 'accepted' && new Date(b.startDatetime) > new Date()
    ).length;

    const subjectCounts = bookings.reduce((acc, booking) => {
      acc[booking.subject] = (acc[booking.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteSubject = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    setTutorStats({
      totalStudents: students.length,
      activeStudents,
      atRiskStudents,
      averageCompletionRate,
      totalTeachingHours,
      studentEngagement,
      upcomingSessions,
      favoriteSubject
    });
  };

  const calculatePerformanceMetrics = (students: StudentProgress[]) => {
    if (students.length === 0) {
      setPerformanceMetrics([]);
      return;
    }

    // Calculate real metrics from student data
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalStudents = students.length;
    const retentionRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    // 2. Average Session Quality (based on completion rate and attendance)
    const avgSessionQuality = students.reduce((acc, student) =>
      acc + (student.completionRate * student.attendance / 100), 0) / students.length;

    // 3. Student Progress Velocity (average completion rate improvement)
    const avgProgressVelocity = students.reduce((acc, student) =>
      acc + student.completionRate, 0) / students.length;

    // 4. Engagement Score (combination of streak, attendance, and completion)
    const avgEngagementScore = students.reduce((acc, student) => {
      const engagement = (student.streak * 10) + (student.attendance * 0.6) + (student.completionRate * 0.4);
      return acc + engagement;
    }, 0) / students.length;

    // Calculate trends (simulated based on current performance)
    const getTrend = (value: number, benchmark: number): { change: number; trend: 'up' | 'down' | 'neutral' } => {
      const change = ((value - benchmark) / benchmark) * 100;
      const roundedChange = Math.abs(change) > 0.1 ? Math.round(change) : 0;

      if (roundedChange > 0) {
        return { change: roundedChange, trend: 'up' as const };
      } else if (roundedChange < 0) {
        return { change: Math.abs(roundedChange), trend: 'down' as const };
      } else {
        return { change: 0, trend: 'neutral' as const };
      }
    };

    // Benchmarks for comparison
    const retentionBenchmark = 75;
    const qualityBenchmark = 70;
    const progressBenchmark = 65;
    const engagementBenchmark = 60;

    const retentionTrend = getTrend(retentionRate, retentionBenchmark);
    const qualityTrend = getTrend(avgSessionQuality, qualityBenchmark);
    const progressTrend = getTrend(avgProgressVelocity, progressBenchmark);
    const engagementTrend = getTrend(avgEngagementScore, engagementBenchmark);

    const metrics: PerformanceMetric[] = [
      {
        label: 'Student Retention',
        value: Math.round(retentionRate),
        change: retentionTrend.change,
        trend: retentionTrend.trend
      },
      {
        label: 'Session Quality',
        value: Math.round(avgSessionQuality),
        change: qualityTrend.change,
        trend: qualityTrend.trend
      },
      {
        label: 'Progress Velocity',
        value: Math.round(avgProgressVelocity),
        change: progressTrend.change,
        trend: progressTrend.trend
      },
      {
        label: 'Engagement Score',
        value: Math.round(avgEngagementScore),
        change: engagementTrend.change,
        trend: engagementTrend.trend
      }
    ];

    setPerformanceMetrics(metrics);
  };

  const getStudentGoals = (student: StudentProgress): StudentGoal[] => [
    {
      id: 'goal-1',
      title: 'Complete 5 Lessons',
      description: 'Build learning foundation',
      target: 5,
      current: student.completedLessons,
      progress: Math.min((student.completedLessons / 5) * 100, 100),
      icon: BookOpen,
      color: 'primary',
      completed: student.completedLessons >= 5,
      studentId: student.studentId
    },
    {
      id: 'goal-2',
      title: 'Master 2 Subjects',
      description: 'Complete all lessons in subjects',
      target: 2,
      current: student.subjectProgress.filter(s => s.progress === 100).length,
      progress: Math.min((student.subjectProgress.filter(s => s.progress === 100).length / 2) * 100, 100),
      icon: GraduationCap,
      color: 'success',
      completed: student.subjectProgress.filter(s => s.progress === 100).length >= 2,
      studentId: student.studentId
    },
    {
      id: 'goal-3',
      title: '4-Week Streak',
      description: 'Maintain consistent learning',
      target: 4,
      current: student.streak,
      progress: Math.min((student.streak / 4) * 100, 100),
      icon: TrendingUp,
      color: 'secondary',
      completed: student.streak >= 4,
      studentId: student.studentId
    }
  ];

  // Message student function
  const handleMessageStudent = async (student: StudentProgress) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to message students',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if conversation already exists
      const threadsResponse = await fetch(`http://localhost:9090/messaging/threads/student/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (threadsResponse.ok) {
        const threads = await threadsResponse.json();

        // Look for existing conversation with this student
        for (const thread of threads) {
          const participantsResponse = await fetch(`http://localhost:9090/messaging/participants/thread/${thread.threadId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (participantsResponse.ok) {
            const participants = await participantsResponse.json();
            const hasStudent = participants.some((p: any) => p.studentId === student.studentId);

            if (hasStudent) {
              // Navigate to existing conversation
              navigate('/messages', { state: { selectedThread: thread.threadId } });
              return;
            }
          }
        }
      }

      // Create new conversation
      const createThreadResponse = await fetch('http://localhost:9090/messaging/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({}),
      });

      if (!createThreadResponse.ok) throw new Error('Failed to create thread');

      const threadData = await createThreadResponse.json();
      const threadId = threadData.threadId || threadData.id;

      // Add both participants
      await Promise.all([
        fetch('http://localhost:9090/messaging/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ threadId, studentId: parseInt(user.id) }),
        }),
        fetch('http://localhost:9090/messaging/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ threadId, studentId: student.studentId }),
        }),
      ]);

      // Navigate to the new conversation
      navigate('/messages', { state: { selectedThread: threadId } });

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive'
      });
    }
  };

  // Generate PDF Report
  const generateStudentReport = async (student: StudentProgress) => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text('Student Progress Report', 105, 20, { align: 'center' });

      // Student Information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Student: ${student.studentName}`, 20, 40);
      doc.text(`Email: ${student.studentEmail}`, 20, 50);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 60);
      doc.text(`Status: ${student.status.toUpperCase()}`, 20, 70);

      // Key Metrics
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Key Performance Metrics', 20, 90);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const metrics = [
        ['Completion Rate', `${student.completionRate.toFixed(1)}%`],
        ['Total Lessons', student.totalLessons.toString()],
        ['Completed Lessons', student.completedLessons.toString()],
        ['Learning Hours', student.totalLearningHours.toFixed(1)],
        ['Current Streak', `${student.streak} weeks`],
        ['Attendance Rate', `${student.attendance.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: 95,
        head: [['Metric', 'Value']],
        body: metrics,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Subject Progress
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Subject Progress', 20, finalY);

      const subjectData = student.subjectProgress.map(subject => [
        subject.subject,
        `${subject.lessonsCompleted}/${subject.totalLessons}`,
        `${subject.progress.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Subject', 'Lessons Completed', 'Progress']],
        body: subjectData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Goals Progress
      const goalsY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Learning Goals', 20, goalsY);

      const goals = getStudentGoals(student);
      const goalsData = goals.map(goal => [
        goal.title,
        `${goal.current}/${goal.target}`,
        `${goal.progress.toFixed(1)}%`,
        goal.completed ? 'Completed' : 'In Progress'
      ]);

      autoTable(doc, {
        startY: goalsY + 5,
        head: [['Goal', 'Progress', 'Completion', 'Status']],
        body: goalsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated by TutorApp - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Save the PDF
      doc.save(`student-report-${student.studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`);

      toast({
        title: 'Success',
        description: 'PDF report generated successfully',
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (!student) return false;

    const searchLower = searchQuery.toLowerCase();
    const nameMatch = student.studentName?.toLowerCase().includes(searchLower) || false;
    const emailMatch = student.studentEmail?.toLowerCase().includes(searchLower) || false;
    const subjectMatch = student.subjectProgress?.some(subject =>
      subject?.subject?.toLowerCase().includes(searchLower)
    ) || false;

    return nameMatch || emailMatch || subjectMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'not-dedicated':
        return <Badge className="bg-destructive text-destructive-foreground">Not Dedicated</Badge>;
      case 'In-Progress-Student':
        return <Badge variant="outline">In-Progress-Student</Badge>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              My Students Dashboard
            </h1>
            <p className="text-white/80 text-lg">
              Monitor student progress and teaching performance
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className="capitalize bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{tutorStats.totalStudents}</p>

              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{tutorStats.averageCompletionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall progress
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teaching Hours</p>
                <p className="text-2xl font-bold">{tutorStats.totalTeachingHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total sessions
                </p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{tutorStats.atRiskStudents}</p>
                <p className="text-xs text-destructive mt-1">
                  Needs attention
                </p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student List */}
        {/* Student List */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle>Student Overview</CardTitle>
                  <CardDescription>
                    Browse and manage all your students
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${selectedStudent?.studentId === student.studentId ? 'ring-2 ring-primary' : ''
                      }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName}`} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {student.studentName?.split(' ').map(n => n[0]).join('') || 'US'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{student.studentName}</p>
                            {getStatusBadge(student.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{student.studentEmail}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{student.completionRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Progress</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                      <div>
                        <p className="text-sm font-medium">{student.completedLessons}</p>
                        <p className="text-xs text-muted-foreground">Lessons</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.streak}w</p>
                        <p className="text-xs text-muted-foreground">Streak</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.totalLearningHours.toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">Hours</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Details & Analytics */}
        <div className="space-y-6">
          {selectedStudent ? (
            <>
              {/* Student Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCheck className="mr-2 h-5 w-5" />
                      Student Details
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessageStudent(selectedStudent)}
                        className="h-8"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateStudentReport(selectedStudent)}
                        disabled={isGeneratingPDF}
                        className="h-8"
                      >
                        {isGeneratingPDF ? (
                          <div className="animate-spin h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.studentName}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {selectedStudent.studentName?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedStudent.studentName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedStudent.studentEmail}</p>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(selectedStudent.status)}
                        <Badge variant="outline">
                          {selectedStudent.streak} week streak
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedStudent.completedLessons}</p>
                      <p className="text-xs text-muted-foreground">Lessons Done</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-success">{selectedStudent.totalLearningHours.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Learning Hours</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-warning">{selectedStudent.attendance.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{selectedStudent.averageSessionLength.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Avg Session</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getStudentGoals(selectedStudent).map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{goal.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target}
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        {goal.completed && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                            Completed ✓
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleMessageStudent(selectedStudent)}
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-xs">Message</span>
                    </Button>
                    <Button
                      onClick={() => generateStudentReport(selectedStudent)}
                      disabled={isGeneratingPDF}
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2"
                    >
                      {isGeneratingPDF ? (
                        <div className="animate-spin h-5 w-5 border-b-2 border-primary" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                      <span className="text-xs">Generate Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Select a Student</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a student from the list to view detailed analytics and progress information.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookCheck className="mr-2 h-5 w-5" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average progress across all students by subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const subjectAverages = students.reduce((acc, student) => {
                student.subjectProgress.forEach(subject => {
                  if (!acc[subject.subject]) {
                    acc[subject.subject] = { total: 0, count: 0 };
                  }
                  acc[subject.subject].total += subject.progress;
                  acc[subject.subject].count++;
                });
                return acc;
              }, {} as Record<string, { total: number; count: number }>);

              return Object.entries(subjectAverages)
                .sort(([, a], [, b]) => (b.total / b.count) - (a.total / a.count))
                .map(([subject, data]) => {
                  const average = data.total / data.count;
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{subject}</span>
                        <span className="text-sm text-muted-foreground">
                          {average.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={average} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{data.count} students</span>
                        <span>attendance</span>
                      </div>
                    </div>
                  );
                });
            })()}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Real-time teaching performance analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.map((metric, index) => {
              // Define descriptions based on the metric label
              const getDescription = (label: string) => {
                switch (label) {
                  case 'Student Retention':
                    return 'Active students maintaining progress';
                  case 'Session Quality':
                    return 'Based on completion and attendance rates';
                  case 'Progress Velocity':
                    return 'Average completion rate across students';
                  case 'Engagement Score':
                    return 'Combined streak, attendance & completion';
                  default:
                    return 'Performance metric';
                }
              };

              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getDescription(metric.label)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-success' :
                          metric.trend === 'down' ? 'text-destructive' :
                            'text-muted-foreground'
                        }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">vs benchmark</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}