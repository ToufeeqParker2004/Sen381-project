package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Services.ResourcesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/resources")
public class ResourcesController {

    @Autowired
    private ResourcesService resourcesService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ReadResourcesDTO createResource(@RequestBody CreateResourcesDTO dto) {
        return resourcesService.createResource(dto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReadResourcesDTO> getResourceById(@PathVariable int id) {
        return resourcesService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReadResourcesDTO> updateResource(@PathVariable int id, @RequestBody UpdateResourcesDTO dto) {
        return resourcesService.updateResource(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteResource(@PathVariable int id) {
        resourcesService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/by-student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public StudentSearchResponse searchByStudent(@PathVariable int studentId) {
        return resourcesService.searchByStudentId(studentId);
    }

    @GetMapping("/search/by-tutor/{tutorId}")
    @PreAuthorize("isAuthenticated()")
    public TutorSearchResponse searchByTutor(@PathVariable int tutorId) {
        return resourcesService.searchByTutorId(tutorId);
    }

    @GetMapping("/search/by-learning-material/{materialId}")
    @PreAuthorize("isAuthenticated()")
    public LearningMaterialSearchResponse searchByLearningMaterial(@PathVariable UUID materialId) {
        return resourcesService.searchByLearningMaterialId(materialId);
    }
}
