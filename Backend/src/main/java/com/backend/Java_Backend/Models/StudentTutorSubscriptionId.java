package com.backend.Java_Backend.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentTutorSubscriptionId implements Serializable {
    @Column(name = "student_id")
    private int studentId;
    @Column(name = "tutor_id")
    private int tutorId;

    public StudentTutorSubscriptionId() { }

    public StudentTutorSubscriptionId(int studentId, int tutorId) {
        this.studentId = studentId;
        this.tutorId = tutorId;
    }

    // Getters and setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getTutorId() { return tutorId; }
    public void setTutorId(int tutorId) { this.tutorId = tutorId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentTutorSubscriptionId)) return false;
        StudentTutorSubscriptionId that = (StudentTutorSubscriptionId) o;
        return studentId == that.studentId && tutorId == that.tutorId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, tutorId);
    }
}

