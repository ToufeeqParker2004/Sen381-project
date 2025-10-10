package com.backend.Java_Backend.Models;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class StudentEventId implements Serializable {

    private Integer studentId;
    private UUID eventId;

    public StudentEventId() {}

    public StudentEventId(Integer studentId, UUID eventId) {
        this.studentId = studentId;
        this.eventId = eventId;
    }

    // Getters and setters
    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudentEventId that = (StudentEventId) o;
        return Objects.equals(studentId, that.studentId) &&
                Objects.equals(eventId, that.eventId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, eventId);
    }
}
