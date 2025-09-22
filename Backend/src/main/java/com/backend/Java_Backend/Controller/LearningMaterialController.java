package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Services.LearningMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
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
    @GetMapping
    public ResponseEntity<List<LearningMaterial>> getAllLearningMaterials() {
        List<LearningMaterial> materials = learningMaterialService.getAllLearningMaterials();
        return ResponseEntity.ok(materials);
    }

    // Get a learning material by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningMaterial> getLearningMaterialById(@PathVariable UUID id) {
        Optional<LearningMaterial> material = learningMaterialService.getMaterialById(id);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get a learning material by title
    @GetMapping("/title/{title}")
    public ResponseEntity<LearningMaterial> getLearningMaterialByTitle(@PathVariable String title) {
        Optional<LearningMaterial> material = learningMaterialService.getLearningMaterialbytitle(title);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new learning material
    @PostMapping
    public ResponseEntity<LearningMaterial> createLearningMaterial(@RequestBody LearningMaterial material) {
        material.setCreated_at(Timestamp.from(Instant.now()));
        LearningMaterial savedMaterial = learningMaterialService.saveLearningMaterial(material);
        return ResponseEntity.ok(savedMaterial);
    }

    // Update an existing learning material
    @PutMapping("/{id}")
    public ResponseEntity<LearningMaterial> updateLearningMaterial(@PathVariable UUID id, @RequestBody LearningMaterial material) {
        Optional<LearningMaterial> existingMaterial = learningMaterialService.getMaterialById(id);
        if (existingMaterial.isPresent()) {
            material.setCreated_at(Timestamp.from(Instant.now()));
            LearningMaterial updatedMaterial = learningMaterialService.saveLearningMaterial(material);
            return ResponseEntity.ok(updatedMaterial);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a learning material
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningMaterial(@PathVariable UUID id) {
        Optional<LearningMaterial> material = learningMaterialService.getMaterialById(id);
        if (material.isPresent()) {
            learningMaterialService.deleteMaterial(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
