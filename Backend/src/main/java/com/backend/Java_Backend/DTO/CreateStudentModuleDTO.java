package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class CreateStudentModuleDTO {
    private int studentId;
    private int moduleId;

    public CreateStudentModuleDTO() {
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }
}
