package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.StudentTutorSubscriptionDTO;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.StudentTutorSubscription;
import com.backend.Java_Backend.Services.StudentTutorSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-tutor")
public class StudentTutorSubscriptionController {

    @Autowired
    private StudentTutorSubscriptionService service;

    @PostMapping
    public ResponseEntity<StudentTutorSubscriptionDTO> create(@RequestBody StudentTutorSubscriptionDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<StudentTutorSubscriptionDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{studentId}/{tutorId}")
    public ResponseEntity<StudentTutorSubscriptionDTO> findById(@PathVariable int studentId, @PathVariable int tutorId) {
        return ResponseEntity.ok(service.findById(studentId, tutorId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentTutorSubscriptionDTO>> findByStudentId(@PathVariable int studentId) {
        return ResponseEntity.ok(service.findByStudentId(studentId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<StudentTutorSubscriptionDTO>> findByTutorId(@PathVariable int tutorId) {
        return ResponseEntity.ok(service.findByTutorId(tutorId));
    }

    @PutMapping("/{studentId}/{tutorId}")
    public ResponseEntity<StudentTutorSubscriptionDTO> update(@PathVariable int studentId, @PathVariable int tutorId, @RequestBody StudentTutorSubscriptionDTO dto) {
        return ResponseEntity.ok(service.update(studentId, tutorId, dto));
    }

    @DeleteMapping("/{studentId}/{tutorId}")
    public ResponseEntity<Void> delete(@PathVariable int studentId, @PathVariable int tutorId) {
        service.delete(studentId, tutorId);
        return ResponseEntity.noContent().build();
    }
}

