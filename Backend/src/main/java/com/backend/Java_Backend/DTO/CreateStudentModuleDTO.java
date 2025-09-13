package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class CreateStudentModuleDTO {
    private int studentId;
    private int moduleId;

    // Constructors
    public CreateStudentModuleDTO() {}

    public CreateStudentModuleDTO(int studentId, int moduleId) {
        this.studentId = studentId;
        this.moduleId = moduleId;
    }

    // Getters and Setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }
}
