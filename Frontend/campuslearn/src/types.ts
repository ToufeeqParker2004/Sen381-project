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
 