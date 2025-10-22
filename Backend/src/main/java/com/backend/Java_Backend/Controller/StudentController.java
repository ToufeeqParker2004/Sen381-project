// StudentController.java (updated)
package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.NotificationSubscription;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Services.AuthService; // Use unified AuthService
import com.backend.Java_Backend.Services.NotificationService;
import com.backend.Java_Backend.Services.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AuthService authService; // Inject AuthService for unified login

    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('STUDENT', 'TUTOR'))")
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('STUDENT', 'TUTOR'))")
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Integer id) {
        StudentDTO student = studentService.getStudentById(id);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student not found"));
        }
        return ResponseEntity.ok(student);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('STUDENT', 'TUTOR') and hasPermission(#id, 'Student', 'own'))")
    @GetMapping("/{id}/modules")
    public ResponseEntity<?> getStudentWithModules(@PathVariable Integer id) {
        StudentWithModuleDTO student = studentService.getStudentWithModules(id);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student not found"));
        }
        return ResponseEntity.ok(student);
    }
    @PreAuthorize("isAuthenticated()")
    @PostMapping // Open for public registration, or add @PreAuthorize("hasRole('ADMIN')") if admin-only
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentDTO createDTO) {
        StudentDTO student = studentService.createStudent(createDTO);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid student data"));
        }
        return ResponseEntity.ok(student);
    }

    //@PreAuthorize("hasRole('ADMIN') or (hasAnyRole('STUDENT', 'TUTOR') and hasPermission(#id, 'Student', 'own'))")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Integer id, @RequestBody UpdateStudentDTO updateDTO) {
        StudentDTO student = studentService.updateStudent(id, updateDTO);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student not found"));
        }
        return ResponseEntity.ok(student);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Integer id) {
        boolean deleted = studentService.deleteStudent(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student not found"));
        }
        return ResponseEntity.noContent().build();
    }

    // Unified login for all users (students, tutors, admins)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getIdentifier(), request.getPassword()); // Use AuthService

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Incorrect identifier or password"));
        }

        return ResponseEntity.ok(Collections.singletonMap("token", token)); // Return as JSON object for clarity
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/updatePassword/{id}")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePassword request, @PathVariable Integer id){
        if (id == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "No ID was found"));
        }

        boolean changed = authService.updatePassword(id, request.getPassword());

        if (changed){
            return ResponseEntity.ok(Collections.singletonMap("message", "Password updated successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Something went wrong"));
        }
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'TUTOR')")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String studentIdStr = (String) authentication.getPrincipal();
            int studentId = Integer.parseInt(studentIdStr);

            StudentDTO student = studentService.getStudentById(studentId);

            if (student != null) {
                return ResponseEntity.ok(student);
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

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/by-tutor/{tutorId}")
    public ResponseEntity<Student> getStudentByTutorId(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(studentService.getStudentByTutorId(tutorId));
    }

}