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
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Target,
  BarChart3,
  Star,
  CheckCircle2,
  Clock4,
  BookCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Lesson {
  id: string;
  subject: string;
  status: string;
  startDatetime: string;
  endDatetime: string;
  tutorName: string;
}

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  totalLearningHours: number;
  averageSessionLength: number;
  favoriteSubject: string;
  streak: number;
  goalsAchieved: number;
  upcomingLessons: number;
}

interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  totalLessons: number;
  progress: number;
  averageRating?: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    completionRate: 0,
    totalLearningHours: 0,
    averageSessionLength: 0,
    favoriteSubject: 'N/A',
    streak: 0,
    goalsAchieved: 0,
    upcomingLessons: 0,
  });
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchStudentLessons();
  }, [user?.id]);

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
      setLessons(data);
      calculateProgressStats(data);
      calculateSubjectProgress(data);
    } catch (error) {
      console.error('Error fetching student lessons:', error);
    }
  };

  const calculateProgressStats = (lessonsData: Lesson[]) => {
    const completedLessons = lessonsData.filter(lesson => lesson.status === 'completed').length;
    const totalLessons = lessonsData.length;
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Calculate learning hours
    const totalHours = lessonsData
      .filter(lesson => lesson.status === 'completed')
      .reduce((total, lesson) => {
        const start = new Date(lesson.startDatetime);
        const end = new Date(lesson.endDatetime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        return total + duration;
      }, 0);

    const averageSessionLength = completedLessons > 0 ? totalHours / completedLessons : 0;

    // Calculate favorite subject
    const subjectCounts = lessonsData.reduce((acc, lesson) => {
      acc[lesson.subject] = (acc[lesson.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteSubject = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate streak (simplified - consecutive weeks with at least one completed lesson)
    const completedLessonDates = lessonsData
      .filter(lesson => lesson.status === 'completed')
      .map(lesson => new Date(lesson.startDatetime).toDateString());

    const streak = calculateStreak(completedLessonDates);

    const upcomingLessons = lessonsData.filter(
      lesson => lesson.status === 'accepted' && new Date(lesson.startDatetime) > new Date()
    ).length;

    setProgressStats({
      totalLessons,
      completedLessons,
      completionRate,
      totalLearningHours: Math.round(totalHours * 10) / 10,
      averageSessionLength: Math.round(averageSessionLength * 10) / 10,
      favoriteSubject,
      streak,
      goalsAchieved: Math.floor(completedLessons / 5), // 1 goal per 5 lessons
      upcomingLessons,
    });
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDates = [...new Set(dates)].sort();
    let streak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) { // Within a week
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return streak;
  };

  const calculateSubjectProgress = (lessonsData: Lesson[]) => {
    const subjectMap = lessonsData.reduce((acc, lesson) => {
      if (!acc[lesson.subject]) {
        acc[lesson.subject] = {
          total: 0,
          completed: 0,
        };
      }
      acc[lesson.subject].total++;
      if (lesson.status === 'completed') {
        acc[lesson.subject].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const progress = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      lessonsCompleted: data.completed,
      totalLessons: data.total,
      progress: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    }));

    setSubjectProgress(progress);
  };

  const getWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return lessons.filter(
      lesson => 
        new Date(lesson.startDatetime) >= oneWeekAgo && 
        lesson.status === 'completed'
    ).length;
  };

  const getMonthlyProgress = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return lessons.filter(
      lesson => 
        new Date(lesson.startDatetime) >= oneMonthAgo && 
        lesson.status === 'completed'
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Learning Progress
            </h1>
            <p className="text-white/80 text-lg">
              Track your journey and celebrate your achievements
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
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{progressStats.completionRate.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress 
              value={progressStats.completionRate} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Hours</p>
                <p className="text-2xl font-bold">{progressStats.totalLearningHours}h</p>
              </div>
              <div className="p-2 bg-success/10 rounded-lg">
                <Clock className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg: {progressStats.averageSessionLength}h per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{progressStats.streak} weeks</p>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Achieved</p>
                <p className="text-2xl font-bold">{progressStats.goalsAchieved}</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Every 5 lessons completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookCheck className="mr-2 h-5 w-5" />
              Subject Progress
            </CardTitle>
            <CardDescription>Your progress across different subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{subject.subject}</span>
                  <span className="text-sm text-muted-foreground">
                    {subject.lessonsCompleted}/{subject.totalLessons} lessons
                  </span>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.progress.toFixed(1)}% complete</span>
                  {subject.progress === 100 && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Completed ✓
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {subjectProgress.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No subject progress data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity & Achievements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressStats.completedLessons >= 1 && (
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Lesson Completed!</p>
                    <p className="text-xs text-muted-foreground">You completed your first lesson</p>
                  </div>
                </div>
              )}

              {progressStats.completedLessons >= 5 && (
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="p-2 bg-success/10 rounded-lg mr-3">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Learning Momentum</p>
                    <p className="text-xs text-muted-foreground">Completed 5+ lessons</p>
                  </div>
                </div>
              )}

              {progressStats.streak >= 2 && (
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="p-2 bg-secondary/10 rounded-lg mr-3">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Consistent Learner</p>
                    <p className="text-xs text-muted-foreground">{progressStats.streak}-week streak</p>
                  </div>
                </div>
              )}

              {progressStats.totalLearningHours >= 10 && (
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="p-2 bg-warning/10 rounded-lg mr-3">
                    <Clock4 className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dedicated Scholar</p>
                    <p className="text-xs text-muted-foreground">10+ hours of learning</p>
                  </div>
                </div>
              )}

              {progressStats.completedLessons === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Complete lessons to unlock achievements!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{progressStats.completedLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons Done</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{progressStats.upcomingLessons}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-red-500">{progressStats.favoriteSubject}</p>
                  <p className="text-xs text-muted-foreground">Favorite Subject</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {timeframe === 'week' ? getWeeklyProgress() : 
                     timeframe === 'month' ? getMonthlyProgress() : 
                     progressStats.completedLessons}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeframe === 'week' ? 'This Week' : 
                     timeframe === 'month' ? 'This Month' : 
                     'Total'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Learning Goals
          </CardTitle>
          <CardDescription>Set and track your learning objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Complete 5 Lessons</h4>
              <Progress 
                value={Math.min((progressStats.completedLessons / 5) * 100, 100)} 
                className="h-2 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {Math.min(progressStats.completedLessons, 5)}/5 completed
              </p>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">10 Learning Hours</h4>
              <Progress 
                value={Math.min((progressStats.totalLearningHours / 10) * 100, 100)} 
                className="h-2 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {progressStats.totalLearningHours.toFixed(1)}/10 hours
              </p>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2">4-Week Streak</h4>
              <Progress 
                value={Math.min((progressStats.streak / 4) * 100, 100)} 
                className="h-2 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {progressStats.streak}/4 weeks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}