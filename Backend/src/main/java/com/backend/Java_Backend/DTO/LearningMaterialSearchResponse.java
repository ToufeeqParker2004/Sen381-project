package com.backend.Java_Backend.DTO;

import java.util.List;
import java.util.UUID;

public class LearningMaterialSearchResponse {
    private UUID learningMaterialId;
    private List<ResourceMatchForLearningMaterialDTO> matches;

    // Getters and Setters
    public UUID getLearningMaterialId() {
        return learningMaterialId;
    }

    public void setLearningMaterialId(UUID learningMaterialId) {
        this.learningMaterialId = learningMaterialId;
    }

    public List<ResourceMatchForLearningMaterialDTO> getMatches() {
        return matches;
    }

    public void setMatches(List<ResourceMatchForLearningMaterialDTO> matches) {
        this.matches = matches;
    }
}