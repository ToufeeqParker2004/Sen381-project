// 🧑 Student type
export interface Student {
  id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
}

// 🎓 Tutor type - CHANGE THESE TO number
export interface Tutor {
  tutorId: number;  // Change from string to number
  studentId: number; // Change from string to number
}

export interface TutorWithStudent extends Tutor {
  student?: Student;
  modules?: Module[];
}

export interface Module {
  id: number;
  module_code: string;
  module_name: string;
  description: string;
}

export interface TutorModule {
  tutorId: number;  // Change from string to number
  moduleId: number;  // Change from string to number
}

export interface StudentResourceResponse {
  studentId: number;
  matches: Match[];
}

export interface Match {
  resourceId: number;
  tutor: TutorInfo;
  learningMaterial: LearningMaterial;
}

export interface TutorInfo {
  id: number;
  studentId: number;
  created_at: string;
  studentEmail: string | null;
  moduleIds: number[] | null;
}

export interface LearningMaterial {
  id: string;
  topicId: number;
  moduleId: number;
  uploaderId: number;
  title: string;
  documentType: string;
  fileUrl: string;
  createdAt: string;
  tags: string[];
}

export interface TutorWithModulesResponse {
  tutor: {
    id: number;
    studentId: number;
    created_at: string;
    studentEmail: string;
  };
  modules: Module[];
}

export interface ErrorRecord {
  id: string;
  createdAt: string;
  message: string;
  stackTrace?: string | null;
  endpoint?: string | null;
  userId?: number | null;
  additional_info?: any | null; // jsonb can be any object
}

export interface ErrorResponse {
  errors: ErrorRecord[];
  page: number;
  size: number;
  total: number;
  hasMore: boolean;
}

 export interface Booking {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  subject: string;
  status: string;
  startDatetime: string;
  endDatetime: string;
  tutorName: string;
}

export interface StudentProgress {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  totalLearningHours: number;
  averageSessionLength: number;
  subjectProgress: SubjectProgress[];
  lastActive: string;
  status: 'active' | 'In-Progress-Student' | 'not-dedicated';
  streak: number;
  attendance: number;
}

 export interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  totalLessons: number;
  progress: number;
}

 export interface TutorStats {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  averageCompletionRate: number;
  totalTeachingHours: number;
  studentEngagement: number;
  upcomingSessions: number;
  favoriteSubject: string;
}

 export interface StudentGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  icon: React.ComponentType<any>;
  color: string;
  completed: boolean;
  studentId: number;
}

 export interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

 