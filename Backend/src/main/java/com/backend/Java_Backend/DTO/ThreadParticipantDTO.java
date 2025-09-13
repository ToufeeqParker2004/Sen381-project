package com.backend.Java_Backend.DTO;

import java.util.UUID;

public class ThreadParticipantDTO {
    private UUID threadId;
    private Integer studentId;

    public ThreadParticipantDTO() {
    }

    public ThreadParticipantDTO(UUID threadId, Integer studentId) {
        this.threadId = threadId;
        this.studentId = studentId;
    }

    // Getters and setters
    public UUID getThreadId() {
        return threadId;
    }

    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }
}
