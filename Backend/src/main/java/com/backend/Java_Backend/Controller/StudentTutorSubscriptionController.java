package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.StudentTutorSubscription;
import com.backend.Java_Backend.Services.StudentTutorSubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-tutor")
public class StudentTutorSubscriptionController {

    private final StudentTutorSubscriptionService service;

    public StudentTutorSubscriptionController(StudentTutorSubscriptionService service) {
        this.service = service;
    }

    // Subscribe a student to a tutor
    @PostMapping("/subscribe")
    public StudentTutorSubscription subscribe(@RequestBody Student student,
                                              @RequestBody Tutor tutor) {
        return service.subscribe(student, tutor);
    }

    // Get tutors for a student
    @GetMapping("/student/{studentId}/tutors")
    public ResponseEntity<List<Tutor>> getTutorsForStudent(@PathVariable int studentId) {
        List<Tutor> tutors = service.getTutorsForStudent(studentId);
        if (tutors.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(tutors);
    }

    // Get students for a tutor
    @GetMapping("/tutor/{tutorId}/students")
    public ResponseEntity<List<Student>> getStudentsForTutor(@PathVariable int tutorId) {
        List<Student> students = service.getStudentsForTutor(tutorId);
        if (students.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(students);
    }
}

