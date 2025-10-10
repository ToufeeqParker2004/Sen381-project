package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Events;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Services.StudentEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/student-events")
public class StudentEventController {

    @Autowired
    private StudentEventService studentEventService;

    @PostMapping("/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> registerForEvent(
            @RequestParam Long studentId,
            @RequestParam UUID eventId) {
        try {
            return ResponseEntity.ok(studentEventService.registerForEvent(studentId, eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/unregister")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unregisterFromEvent(
            @RequestParam Long studentId,
            @RequestParam UUID eventId) {
        try {
            studentEventService.unregisterFromEvent(studentId, eventId);
            return ResponseEntity.ok().body("Successfully unregistered from event");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Events>> getEventsByStudentId(@PathVariable Long studentId) {
        List<Events> events = studentEventService.getEventsByStudentId(studentId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Student>> getStudentsByEventId(@PathVariable UUID eventId) {
        List<Student> students = studentEventService.getStudentsByEventId(eventId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/check-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isStudentRegisteredForEvent(
            @RequestParam Long studentId,
            @RequestParam UUID eventId) {
        boolean isRegistered = studentEventService.isStudentRegisteredForEvent(studentId, eventId);
        return ResponseEntity.ok(isRegistered);
    }

    @GetMapping("/event/{eventId}/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> getRegistrationCountForEvent(@PathVariable UUID eventId) {
        int count = studentEventService.getRegistrationCountForEvent(eventId);
        return ResponseEntity.ok(count);
    }
}