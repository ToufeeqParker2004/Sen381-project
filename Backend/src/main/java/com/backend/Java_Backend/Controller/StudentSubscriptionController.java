package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.StudentSubscriptionsDTO;
import com.backend.Java_Backend.Services.StudentSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student-subscriptions")
public class StudentSubscriptionController {
    @Autowired
    private StudentSubscriptionService service;

    @PostMapping
    public ResponseEntity<StudentSubscriptionsDTO> create(@RequestBody StudentSubscriptionsDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentSubscriptionsDTO> findByStudentId(@PathVariable int studentId) {
        return ResponseEntity.ok(service.findByStudentId(studentId));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<StudentSubscriptionsDTO> update(@PathVariable int studentId, @RequestBody StudentSubscriptionsDTO dto) {
        return ResponseEntity.ok(service.update(studentId, dto));
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> delete(@PathVariable int studentId) {
        service.delete(studentId);
        return ResponseEntity.noContent().build();
    }
}
