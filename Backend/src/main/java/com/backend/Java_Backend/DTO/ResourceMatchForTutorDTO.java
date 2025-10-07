package com.backend.Java_Backend.DTO;

public class ResourceMatchForTutorDTO {
    private int resourceId;
    private StudentDTO student;
    private LearningMaterialDTO learningMaterial;

    // Getters and Setters
    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
        this.resourceId = resourceId;
    }

    public StudentDTO getStudent() {
        return student;
    }

    public void setStudent(StudentDTO student) {
        this.student = student;
    }

    public LearningMaterialDTO getLearningMaterial() {
        return learningMaterial;
    }

    public void setLearningMaterial(LearningMaterialDTO learningMaterial) {
        this.learningMaterial = learningMaterial;
    }
}
