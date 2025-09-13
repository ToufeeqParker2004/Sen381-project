package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class StudentTutorSubscriptionDTO {
    private int studentId;
    private int tutorId;
    private LocalDateTime createdAt;

    public StudentTutorSubscriptionDTO() {}

    public StudentTutorSubscriptionDTO(int studentId, int tutorId, LocalDateTime createdAt) {
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.createdAt = createdAt;
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getTutorId() { return tutorId; }
    public void setTutorId(int tutorId) { this.tutorId = tutorId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
