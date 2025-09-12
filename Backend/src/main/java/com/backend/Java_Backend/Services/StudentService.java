package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Repository.StudentModuleRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentModuleRepository studentModuleRepository;
    @Autowired
    public StudentService(StudentRepository studentRepository,StudentModuleRepository studentModuleRepository) {

        this.studentRepository = studentRepository;
        this.studentModuleRepository = studentModuleRepository;
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get a student by ID
    public Optional<Student> getStudentById(int id) {
        return studentRepository.findById(id);
    }

    // Save or update a student
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    // Delete a student by ID
    public void deleteStudent(int id) {
        studentRepository.deleteById(id);
    }

    // Find student by email
    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public List<Modules> getModulesForStudent(int studentId) {
        List<StudentModule> enrollments = studentModuleRepository.findByStudentId(studentId);
        List<Modules> modules = new ArrayList<>();
        for (StudentModule sm : enrollments) {
            modules.add(sm.getModule());
        }
        return modules;
    }

    //Student login for auth
    public String login(String email, String password) {
        // Get student directly
        Student student = studentRepository.findByEmail(email);

        if (student == null) {
            return null; // email not found
        }

        // Plaintext password check
        if (!student.getPassword().equals(password)) {
            return null; // wrong password
        }

        // Generate JWT token
        return JwtUtil.generateToken(student.getId(), student.getEmail());
    }
}
