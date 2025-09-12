package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Security.JwtUtil;
import com.backend.Java_Backend.Services.StudentService;
import com.backend.Java_Backend.Services.StudentTopicSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;
    private final StudentTopicSubscriptionService service;
    @Autowired
    public StudentController(StudentService studentService,StudentTopicSubscriptionService stService) {
        this.studentService = studentService;
        this.service = stService;
    }

    // Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable int id) {
        Optional<Student> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new student
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable int id, @RequestBody Student updatedStudent) {
        return studentService.getStudentById(id).map(student -> {
            student.setName(updatedStudent.getName());
            student.setEmail(updatedStudent.getEmail());
            student.setPhone_number(updatedStudent.getPhone_number());
            student.setBio(updatedStudent.getBio());
            student.setPassword(updatedStudent.getPassword());
            return ResponseEntity.ok(studentService.saveStudent(student));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable int id) {
        if (studentService.getStudentById(id).isPresent()) {
            studentService.deleteStudent(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Find student by email
    @GetMapping("/search")
    public ResponseEntity<Student> getStudentByEmail(@RequestParam String email) {
        Student student = studentService.getStudentByEmail(email);
        return student != null ? ResponseEntity.ok(student) : ResponseEntity.notFound().build();
    }
    // Get modules for a student
    @GetMapping("/{studentId}/modules")
    public ResponseEntity<List<Modules>> getModules(@PathVariable int studentId) {
        List<Modules> modules = studentService.getModulesForStudent(studentId);
        if (modules.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(modules);
    }
    // Subscribe a student to a topic
    @PostMapping("/subscribe")
    public StudentTopicSubscription subscribe(@RequestBody Student student,
                                              @RequestBody Topic topic) {
        return service.subscribe(student, topic);
    }

    // Get topics for a student
    @GetMapping("/student/{studentId}/topics")
    public ResponseEntity<List<Topic>> getTopicsForStudent(@PathVariable int studentId) {
        List<Topic> topics = service.getTopicsForStudent(studentId);
        if (topics.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(topics);
    }

    // Get students subscribed to a topic
    @GetMapping("/topic/{topicId}/students")
    public ResponseEntity<List<Student>> getStudentsForTopic(@PathVariable int topicId) {
        List<Student> students = service.getStudentsForTopic(topicId);
        if (students.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(students);
    }

    // Student login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        String token = studentService.login(email, password);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect email or password");
        }

        return ResponseEntity.ok(token); // returns JWT
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String studentIdStr = (String) authentication.getPrincipal();
            int studentId = Integer.parseInt(studentIdStr);

            Optional<Student> studentOpt = studentService.getStudentById(studentId);

            if (studentOpt.isPresent()) {
                return ResponseEntity.ok(studentOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Student not found"));
            }

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid student ID"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Something went wrong"));
        }
    }

}
