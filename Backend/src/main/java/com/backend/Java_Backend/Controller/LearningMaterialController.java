package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Services.LearningMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/learning-materials")
public class LearningMaterialController {

    private final LearningMaterialService learningMaterialService;

    @Autowired
    public LearningMaterialController(LearningMaterialService learningMaterialService) {
        this.learningMaterialService = learningMaterialService;
    }

    // Get all learning materials
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<LearningMaterial>> getAllLearningMaterials() {
        List<LearningMaterial> materials = learningMaterialService.getAllLearningMaterials();
        return ResponseEntity.ok(materials);
    }

    // Get a learning material by ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<LearningMaterial> getLearningMaterialById(@PathVariable UUID id) {
        Optional<LearningMaterial> material = learningMaterialService.getMaterialById(id);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get a learning material by title
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/title/{title}")
    public ResponseEntity<LearningMaterial> getLearningMaterialByTitle(@PathVariable String title) {
        Optional<LearningMaterial> material = learningMaterialService.getLearningMaterialbytitle(title);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new learning material
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> createLearningMaterial(@RequestBody LearningMaterial material, Authentication authentication) {
        try {
            String principal = (String) authentication.getPrincipal();
            int uploaderId = Integer.parseInt(principal); // Tutor ID
            material.setUploader_id(uploaderId);
            material.setCreated_at(Timestamp.from(Instant.now()));
            LearningMaterial savedMaterial = learningMaterialService.saveLearningMaterial(material);
            return ResponseEntity.ok(savedMaterial);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Only tutors and admins can create learning materials"));
        }
    }

    // Update an existing learning material
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'LearningMaterial', 'own')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningMaterial(@PathVariable UUID id, @RequestBody LearningMaterial material) {
        Optional<LearningMaterial> existingMaterial = learningMaterialService.getMaterialById(id);
        if (existingMaterial.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Learning material not found"));
        }
        LearningMaterial existing = existingMaterial.get();
        existing.setTopic_id(material.getTopic_id());
        existing.setModule_id(material.getModule_id());
        existing.setUploader_id(material.getUploader_id());
        existing.setTitle(material.getTitle());
        existing.setDocument_type(material.getDocument_type());
        existing.setFile_url(material.getFile_url());
        existing.setTags(material.getTags());
        existing.setCreated_at(Timestamp.from(Instant.now()));
        LearningMaterial updatedMaterial = learningMaterialService.saveLearningMaterial(existing);
        return ResponseEntity.ok(updatedMaterial);
    }

    // Delete a learning material
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'LearningMaterial', 'own')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningMaterial(@PathVariable UUID id) {
        if (learningMaterialService.getMaterialById(id).isPresent()) {
            learningMaterialService.deleteMaterial(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "Learning material not found"));
    }
}
