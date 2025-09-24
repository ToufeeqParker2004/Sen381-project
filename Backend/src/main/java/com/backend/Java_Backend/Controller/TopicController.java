package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.TopicDTO;
import com.backend.Java_Backend.Services.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/topics")
public class TopicController {
    @Autowired
    private TopicService service;

    // Create a new topic
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TopicDTO dto, Authentication authentication) {
        try {
            String principal = (String) authentication.getPrincipal();
            int creatorId = Integer.parseInt(principal); // Tutor or Admin ID
            dto.setCreatorId(creatorId);
            TopicDTO createdTopic = service.create(dto);
            return ResponseEntity.ok(createdTopic);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Only tutors and admins can create topics"));
        }
    }

    // Get all topics
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<TopicDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Get a topic by ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<TopicDTO> findById(@PathVariable int id) {
        TopicDTO topic = service.findById(id);
        if (topic == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        return ResponseEntity.ok(topic);
    }

    // Get topics by module ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<TopicDTO>> findByModuleId(@PathVariable int moduleId) {
        return ResponseEntity.ok(service.findByModule_id(moduleId));
    }

    // Get topics by creator ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<TopicDTO>> findByCreatorId(@PathVariable int creatorId) {
        return ResponseEntity.ok(service.findByCreatorId(creatorId));
    }

    // Update an existing topic
    @PreAuthorize("hasAnyRole('ADMIN', 'TUTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody TopicDTO dto) {
        TopicDTO updatedTopic = service.update(id, dto);
        if (updatedTopic == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Topic not found"));
        }
        return ResponseEntity.ok(updatedTopic);
    }

    // Delete a topic
    @PreAuthorize("hasAnyRole('ADMIN', 'TUTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (service.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Topic not found"));
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
