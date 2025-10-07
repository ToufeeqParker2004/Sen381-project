package com.backend.Java_Backend.DTO;

public class ReadResourcesDTO {
    private int id;
    private StudentDTO student;
    private LearningMaterialDTO learningMaterial;
    private TutorDTO tutor;

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public TutorDTO getTutor() {
        return tutor;
    }

    public void setTutor(TutorDTO tutor) {
        this.tutor = tutor;
    }
}
