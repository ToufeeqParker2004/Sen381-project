package com.backend.Java_Backend.DTO;

import java.util.UUID;

public class CreateResourcesDTO {
    private int studentId;
    private UUID learningMaterialsId;
    private int tutorId;

    // Getters and Setters
    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public UUID getLearningMaterialsId() {
        return learningMaterialsId;
    }

    public void setLearningMaterialsId(UUID learningMaterialsId) {
        this.learningMaterialsId = learningMaterialsId;
    }

    public int getTutorId() {
        return tutorId;
    }

    public void setTutorId(int tutorId) {
        this.tutorId = tutorId;
    }
}