package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class UpdateStudentModuleDTO {
    private LocalDateTime enrolledAt;

    // Constructors
    public UpdateStudentModuleDTO() {}

    public UpdateStudentModuleDTO(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    // Getters and Setters
    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}
