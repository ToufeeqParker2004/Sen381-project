package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.CreateStudentDTO;
import com.backend.Java_Backend.DTO.StudentDTO;
import com.backend.Java_Backend.DTO.StudentWithModuleDTO;
import com.backend.Java_Backend.DTO.UpdateStudentDTO;
import com.backend.Java_Backend.Models.*;
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



    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Integer id) {
        StudentDTO student = studentService.getStudentById(id);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(student);
    }

    @GetMapping("/{id}/modules")
    public ResponseEntity<StudentWithModuleDTO> getStudentWithModules(@PathVariable Integer id) {
        StudentWithModuleDTO student = studentService.getStudentWithModules(id);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(student);
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@RequestBody CreateStudentDTO createDTO) {
        StudentDTO student = studentService.createStudent(createDTO);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Integer id, @RequestBody UpdateStudentDTO updateDTO) {
        StudentDTO student = studentService.updateStudent(id, updateDTO);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer id) {
        boolean deleted = studentService.deleteStudent(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // Student login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = studentService.login(request.getEmail(), request.getPassword());

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect email or password");
        }

        return ResponseEntity.ok(token); // JWT token as plain text
    }


    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String studentIdStr = (String) authentication.getPrincipal();
            int studentId = Integer.parseInt(studentIdStr);

            StudentDTO studentOpt = studentService.getStudentById(studentId);

            if (studentOpt != null) {
                return ResponseEntity.ok(studentOpt);
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
