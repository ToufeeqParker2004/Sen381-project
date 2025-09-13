// DTOs for StudentModule
package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class StudentModuleDTO {
    private int studentId;
    private int moduleId;
    private LocalDateTime enrolledAt;

    // Constructors
    public StudentModuleDTO() {}

    public StudentModuleDTO(int studentId, int moduleId, LocalDateTime enrolledAt) {
        this.studentId = studentId;
        this.moduleId = moduleId;
        this.enrolledAt = enrolledAt;
    }

    // Getters and Setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}
