package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.PersonalEvent;
import com.backend.Java_Backend.Repository.PersonalEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal-events")
public class PersonalEventController {

    @Autowired
    private PersonalEventRepository personalEventRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PersonalEvent>> getPersonalEventsByStudent(@PathVariable Integer studentId) {
        try {
            List<PersonalEvent> events = personalEventRepository.findByStudentIdOrderByDateAscStartTimeAsc(studentId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createPersonalEvent(@RequestBody PersonalEvent personalEvent) {
        try {
            // Validate required fields
            if (personalEvent.getTitle() == null || personalEvent.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (personalEvent.getDate() == null) {
                return ResponseEntity.badRequest().body("Date is required");
            }
            if (personalEvent.getStudentId() == null) {
                return ResponseEntity.badRequest().body("Student ID is required");
            }

            PersonalEvent savedEvent = personalEventRepository.save(personalEvent);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating personal event: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePersonalEvent(@PathVariable Integer id, @RequestBody PersonalEvent personalEvent) {
        try {
            Optional<PersonalEvent> existingEvent = personalEventRepository.findById(id);
            if (existingEvent.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            personalEvent.setId(id);
            PersonalEvent updatedEvent = personalEventRepository.save(personalEvent);
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating personal event: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePersonalEvent(@PathVariable Integer id) {
        try {
            if (!personalEventRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            personalEventRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting personal event: " + e.getMessage());
        }
    }

    // Secure delete - only allow deleting own events
    @DeleteMapping("/{id}/student/{studentId}")
    public ResponseEntity<?> deletePersonalEventForStudent(
            @PathVariable Integer id,
            @PathVariable Integer studentId) {
        try {
            Optional<PersonalEvent> event = personalEventRepository.findByIdAndStudentId(id, studentId);
            if (event.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            personalEventRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting personal event: " + e.getMessage());
        }
    }

    // Get events for a specific date range
    @GetMapping("/student/{studentId}/range")
    public ResponseEntity<List<PersonalEvent>> getEventsInRange(
            @PathVariable Integer studentId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<PersonalEvent> events = personalEventRepository.findByStudentIdAndDateBetween(studentId, start, end);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}