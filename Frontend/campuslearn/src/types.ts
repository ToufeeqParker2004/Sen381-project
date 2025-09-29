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
  moduleId: number;
  module_code: string;
  module_name: string;
  description: string;
}

export interface TutorModule {
  tutorId: number;  // Change from string to number
  moduleId: number;  // Change from string to number
}