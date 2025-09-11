package com.backend.Java_Backend.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ThreadParticipantId implements Serializable {
    @Column(name = "thread_id")
    private UUID threadId;
    @Column(name = "student_id")
    private Integer studentId;

    public ThreadParticipantId() { }

    public ThreadParticipantId(UUID threadId, int userId) {
        this.threadId = threadId;
        this.studentId = userId;
    }

    // Getters and setters
    public UUID getThreadId() { return threadId; }
    public void setThreadId(UUID threadId) { this.threadId = threadId; }

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ThreadParticipantId)) return false;
        ThreadParticipantId that = (ThreadParticipantId) o;
        return threadId.equals(that.threadId) && studentId.equals(that.studentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(threadId, studentId);
    }
}

