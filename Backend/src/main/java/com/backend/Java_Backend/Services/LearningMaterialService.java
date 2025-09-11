package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Repository.LearningMatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LearningMaterialService {
    private final LearningMatRepository learningMatRepository;

    @Autowired
    public LearningMaterialService(LearningMatRepository learningMatRepository) {
        this.learningMatRepository = learningMatRepository;
    }

    // Get all Learning Materials
    public List<LearningMaterial> getAllLearningMaterials() {
        return learningMatRepository.findAll();
    }

    // Get a learning Material by ID
    public Optional<LearningMaterial> getMaterialById(UUID id) {
        return learningMatRepository.findById(id);
    }

    // Save or update a Learning Material
    public LearningMaterial saveLearningMaterial(LearningMaterial material) {
        return learningMatRepository.save(material);
    }

    // Delete a Learning Material by ID
    public void deleteMaterial(UUID id) {
        learningMatRepository.deleteById(id);
    }

    // Find student by email
    public Optional<LearningMaterial> getLearningMaterialbytitle(String title) {
        return learningMatRepository.findByTitle(title);
    }
}
