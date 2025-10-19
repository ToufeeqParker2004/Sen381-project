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
  Zap,
  Trophy,
  Brain,
  GraduationCap,
  Lightbulb,
  Bookmark,
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
  uniqueTutors: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  totalLessons: number;
  progress: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  icon: React.ComponentType<any>;
  color: string;
  completed: boolean;
  type: 'lessons' | 'hours' | 'streak' | 'tutors' | 'subjects' | 'consistency';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
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
    uniqueTutors: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
  });
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [showAllAchievements, setShowAllAchievements] = useState(false);

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
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
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

    // Calculate unique tutors from COMPLETED lessons only
    const completedLessonsData = lessonsData.filter(lesson => lesson.status === 'completed');
    const uniqueTutors = new Set(completedLessonsData.map(lesson => lesson.tutorName)).size;

    // Calculate streak
    const completedLessonDates = completedLessonsData
      .map(lesson => new Date(lesson.startDatetime).toDateString());

    const streak = calculateStreak(completedLessonDates);

    const upcomingLessons = lessonsData.filter(
      lesson => lesson.status === 'accepted' && new Date(lesson.startDatetime) > new Date()
    ).length;

    const weeklyProgress = getWeeklyProgress(lessonsData);
    const monthlyProgress = getMonthlyProgress(lessonsData);

    const stats = {
      totalLessons,
      completedLessons,
      completionRate,
      totalLearningHours: Math.round(totalHours * 10) / 10,
      averageSessionLength: Math.round(averageSessionLength * 10) / 10,
      favoriteSubject,
      streak,
      goalsAchieved: 0, // Will be calculated based on goals
      upcomingLessons,
      uniqueTutors,
      weeklyProgress,
      monthlyProgress,
    };

    setProgressStats(stats);
    
    // Calculate subject progress first, then goals and achievements
    const subjectProgressData = calculateSubjectProgress(lessonsData);
    setSubjectProgress(subjectProgressData);
    
    // Now calculate goals with the updated subject progress
    calculateGoals(stats, subjectProgressData);
    calculateAchievements(stats, subjectProgressData);
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

      if (diffDays <= 7) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return streak;
  };

  const calculateSubjectProgress = (lessonsData: Lesson[]): SubjectProgress[] => {
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

    return progress;
  };

  const getWeeklyProgress = (lessonsData: Lesson[] = lessons) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return lessonsData.filter(
      lesson => 
        new Date(lesson.startDatetime) >= oneWeekAgo && 
        lesson.status === 'completed'
    ).length;
  };

  const getMonthlyProgress = (lessonsData: Lesson[] = lessons) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return lessonsData.filter(
      lesson => 
        new Date(lesson.startDatetime) >= oneMonthAgo && 
        lesson.status === 'completed'
    ).length;
  };

  const calculateGoals = (stats: ProgressStats, subjectProgressData: SubjectProgress[]) => {
    const completedSubjectsCount = subjectProgressData.filter(subj => subj.progress === 100).length;
    
    const newGoals: Goal[] = [
      {
        id: 'goal-1',
        title: 'Complete 5 Lessons',
        description: 'Build your learning foundation',
        target: 5,
        current: stats.completedLessons,
        progress: Math.min((stats.completedLessons / 5) * 100, 100),
        icon: BookOpen,
        color: 'primary',
        completed: stats.completedLessons >= 5,
        type: 'lessons'
      },
      {
        id: 'goal-2',
        title: '10 Learning Hours',
        description: 'Dedicate time to master skills',
        target: 10,
        current: stats.totalLearningHours,
        progress: Math.min((stats.totalLearningHours / 10) * 100, 100),
        icon: Clock,
        color: 'success',
        completed: stats.totalLearningHours >= 10,
        type: 'hours'
      },
      {
        id: 'goal-3',
        title: '4-Week Streak',
        description: 'Maintain consistent learning',
        target: 4,
        current: stats.streak,
        progress: Math.min((stats.streak / 4) * 100, 100),
        icon: TrendingUp,
        color: 'secondary',
        completed: stats.streak >= 4,
        type: 'streak'
      },
      {
        id: 'goal-4',
        title: 'Learn from 3 Tutors',
        description: 'Expand your perspectives',
        target: 3,
        current: stats.uniqueTutors,
        progress: Math.min((stats.uniqueTutors / 3) * 100, 100),
        icon: Users,
        color: 'warning',
        completed: stats.uniqueTutors >= 3,
        type: 'tutors'
      },
      {
        id: 'goal-5',
        title: 'Master 2 Subjects',
        description: 'Complete all lessons in subjects',
        target: 2,
        current: completedSubjectsCount,
        progress: Math.min((completedSubjectsCount / 2) * 100, 100),
        icon: GraduationCap,
        color: 'primary',
        completed: completedSubjectsCount >= 2,
        type: 'subjects'
      },
      {
        id: 'goal-6',
        title: 'Weekly Consistency',
        description: 'Complete lessons every week this month',
        target: 4,
        current: Math.min(stats.weeklyProgress, 4),
        progress: Math.min((Math.min(stats.weeklyProgress, 4) / 4) * 100, 100),
        icon: Zap,
        color: 'success',
        completed: stats.weeklyProgress >= 4,
        type: 'consistency'
      }
    ];

    setGoals(newGoals);
    
    // Update goals achieved count
    const goalsAchieved = newGoals.filter(goal => goal.completed).length;
    setProgressStats(prev => ({ ...prev, goalsAchieved }));
  };

  const calculateAchievements = (stats: ProgressStats, subjectProgressData: SubjectProgress[]) => {
    const completedSubjectsCount = subjectProgressData.filter(subj => subj.progress === 100).length;
    
    const newAchievements: Achievement[] = [
      {
        id: 'ach-1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: Star,
        color: 'primary',
        unlocked: stats.completedLessons >= 1
      },
      {
        id: 'ach-2',
        title: 'Learning Momentum',
        description: 'Complete 5+ lessons',
        icon: Target,
        color: 'success',
        unlocked: stats.completedLessons >= 5
      },
      {
        id: 'ach-3',
        title: 'Consistent Learner',
        description: 'Maintain a 2-week streak',
        icon: TrendingUp,
        color: 'secondary',
        unlocked: stats.streak >= 2
      },
      {
        id: 'ach-4',
        title: 'Dedicated Scholar',
        description: 'Reach 10+ learning hours',
        icon: Clock4,
        color: 'warning',
        unlocked: stats.totalLearningHours >= 10
      },
      {
        id: 'ach-5',
        title: 'Subject Explorer',
        description: 'Learn from multiple tutors',
        icon: Users,
        color: 'primary',
        unlocked: stats.uniqueTutors >= 2
      },
      {
        id: 'ach-6',
        title: 'Rising Star',
        description: 'Complete 10 lessons',
        icon: Trophy,
        color: 'success',
        unlocked: stats.completedLessons >= 10
      },
      {
        id: 'ach-7',
        title: 'Knowledge Seeker',
        description: 'Master your first subject',
        icon: Brain,
        color: 'secondary',
        unlocked: completedSubjectsCount >= 1
      },
      {
        id: 'ach-8',
        title: 'Learning Champion',
        description: 'Complete 25 lessons',
        icon: Award,
        color: 'warning',
        unlocked: stats.completedLessons >= 25,
        progress: Math.min(stats.completedLessons, 25),
        target: 25
      }
    ];

    setAchievements(newAchievements);
  };

  const getUnlockedAchievements = () => achievements.filter(ach => ach.unlocked);
  const getLockedAchievements = () => achievements.filter(ach => !ach.unlocked);

  const getDisplayedAchievements = () => {
    if (showAllAchievements) {
      return achievements;
    }
    return getUnlockedAchievements().slice(0, 4);
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
                <p className="text-2xl font-bold">{progressStats.goalsAchieved}/{goals.length}</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {goals.filter(g => g.completed).length} of {goals.length} completed
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
                Achievements ({getUnlockedAchievements().length}/{achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getDisplayedAchievements().map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center p-3 border rounded-lg ${
                      achievement.unlocked ? 'bg-muted/20' : 'bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className={`p-2 bg-${achievement.color}/10 rounded-lg mr-3`}>
                      <Icon className={`h-4 w-4 text-${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.target !== undefined && (
                        <div className="mt-1">
                          <Progress 
                            value={(achievement.progress / achievement.target) * 100} 
                            className="h-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}/{achievement.target}
                          </p>
                        </div>
                      )}
                    </div>
                    {achievement.unlocked ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Unlocked ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                        Locked
                      </Badge>
                    )}
                  </div>
                );
              })}

              {getUnlockedAchievements().length === 0 && !showAllAchievements && (
                <p className="text-center text-muted-foreground py-4">
                  Complete lessons to unlock achievements!
                </p>
              )}

              {achievements.length > 4 && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowAllAchievements(!showAllAchievements)}
                  >
                    {showAllAchievements ? 'Show Less' : 'View All Achievements'}
                  </Button>
                </div>
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
                  <p className="text-2xl font-bold text-success">{progressStats.upcomingLessons}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-secondary">{progressStats.favoriteSubject}</p>
                  <p className="text-xs text-muted-foreground">Top Subject</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-warning">
                    {timeframe === 'week' ? progressStats.weeklyProgress : 
                     timeframe === 'month' ? progressStats.monthlyProgress : 
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
            Learning Goals ({goals.filter(g => g.completed).length}/{goals.length})
          </CardTitle>
          <CardDescription>Track your progress towards learning objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <div 
                  key={goal.id} 
                  className={`p-4 border rounded-lg text-center ${
                    goal.completed ? 'bg-success/5 border-success/20' : 'bg-background'
                  }`}
                >
                  <div className={`w-12 h-12 bg-${goal.color}/10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    goal.completed ? 'bg-success/20' : ''
                  }`}>
                    <Icon className={`h-6 w-6 text-${goal.color} ${goal.completed ? 'text-success' : ''}`} />
                  </div>
                  <h4 className="font-semibold mb-2">{goal.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{goal.description}</p>
                  <Progress 
                    value={goal.progress} 
                    className={`h-2 mb-2 ${goal.completed ? 'bg-success/20' : ''}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {goal.current}/{goal.target} {goal.type === 'hours' ? 'hours' : 
                     goal.type === 'streak' ? 'weeks' : 
                     goal.type === 'tutors' ? 'tutors' :
                     goal.type === 'subjects' ? 'subjects' : 'completed'}
                  </p>
                  {goal.completed && (
                    <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/20">
                      Completed ✓
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}