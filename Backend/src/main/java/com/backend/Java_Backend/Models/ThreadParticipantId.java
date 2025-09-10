package com.backend.Java_Backend.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ThreadParticipantId implements Serializable {
    @Column(name = "thread_id")
    private UUID threadID;
    @Column(name = "student_id")
    private Long userId;

    public ThreadParticipantId() { }

    public ThreadParticipantId(UUID threadID, Long userId) {
        this.threadID = threadID;
        this.userId = userId;
    }

    // Getters and setters
    public UUID getThreadID() { return threadID; }
    public void setThreadID(UUID threadID) { this.threadID = threadID; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ThreadParticipantId)) return false;
        ThreadParticipantId that = (ThreadParticipantId) o;
        return threadID.equals(that.threadID) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(threadID, userId);
    }
}

