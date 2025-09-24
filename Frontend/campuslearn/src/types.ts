

// 🧑 Student type
export interface Student {
  id: number;
  name: string;
  email: string;
  
}

// 🎓 Tutor type
export interface Tutor {
  tutorId: string;
  studentId: string;
}

export interface TutorWithStudent extends Tutor {
  student?: Student;
}

export interface Module{
  moduleId : number;
  module_code : string;
  module_name:string;
   description:string;
}


export interface TutorModule {
  id: string;           // optional, if table has a primary key
  tutorId: string;      // match column name in your table
  moduleId: string;
}

