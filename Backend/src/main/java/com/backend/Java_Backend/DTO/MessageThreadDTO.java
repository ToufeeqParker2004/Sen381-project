package com.backend.Java_Backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Timestamp;
import java.util.UUID;

public class MessageThreadDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID threadId;
    private Timestamp created_at;


    public MessageThreadDTO() {
    }

    public MessageThreadDTO(UUID threadId, Timestamp created_at) {
        this.threadId = threadId;
        this.created_at = created_at;

    }

    // Getters and setters
    public UUID getThreadId() {
        return threadId;
    }

    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }


}
