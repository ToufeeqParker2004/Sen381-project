package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.UUID;

public class MessageDTO {
    private UUID id;
    private int senderId;
    private String content;
    private Timestamp timestamp;
    private UUID threadId;

    public MessageDTO() {
    }

    public MessageDTO(UUID id, int senderId, String content, Timestamp timestamp, UUID threadId) {
        this.id = id;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
        this.threadId = threadId;
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getSenderId() {
        return senderId;
    }

    public void setSenderId(int senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public UUID getThreadId() {
        return threadId;
    }

    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }
}
