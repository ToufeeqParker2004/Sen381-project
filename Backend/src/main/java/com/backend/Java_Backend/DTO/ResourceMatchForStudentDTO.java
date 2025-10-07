package com.backend.Java_Backend.DTO;

public class ResourceMatchForStudentDTO {
    private int resourceId;
    private TutorDTO tutor;
    private LearningMaterialDTO learningMaterial;

    // Getters and Setters
    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
        this.resourceId = resourceId;
    }

    public TutorDTO getTutor() {
        return tutor;
    }

    public void setTutor(TutorDTO tutor) {
        this.tutor = tutor;
    }

    public LearningMaterialDTO getLearningMaterial() {
        return learningMaterial;
    }

    public void setLearningMaterial(LearningMaterialDTO learningMaterial) {
        this.learningMaterial = learningMaterial;
    }
}
