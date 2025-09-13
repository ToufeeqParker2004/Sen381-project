package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public class MessageThreadDTO {
    private UUID threadId;
    private Timestamp createdAt;
    private List<Integer> participantIds;
    private List<UUID> messageIds;

    public MessageThreadDTO() {
    }

    public MessageThreadDTO(UUID threadId, Timestamp createdAt, List<Integer> participantIds, List<UUID> messageIds) {
        this.threadId = threadId;
        this.createdAt = createdAt;
        this.participantIds = participantIds;
        this.messageIds = messageIds;
    }

    // Getters and setters
    public UUID getThreadId() {
        return threadId;
    }

    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public List<Integer> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Integer> participantIds) {
        this.participantIds = participantIds;
    }

    public List<UUID> getMessageIds() {
        return messageIds;
    }

    public void setMessageIds(List<UUID> messageIds) {
        this.messageIds = messageIds;
    }
}
