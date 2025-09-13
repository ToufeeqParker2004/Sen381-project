package com.backend.Java_Backend.DTO;

public class TutorModuleDTO {
    private int tutorId;
    private int moduleId;

    public TutorModuleDTO() {}

    public TutorModuleDTO(int tutorId, int moduleId) {
        this.tutorId = tutorId;
        this.moduleId = moduleId;
    }

    public int getTutorId() { return tutorId; }
    public void setTutorId(int tutorId) { this.tutorId = tutorId; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }
}
