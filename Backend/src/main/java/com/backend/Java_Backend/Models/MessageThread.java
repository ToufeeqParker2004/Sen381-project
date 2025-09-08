package com.backend.Java_Backend.Models;

import java.sql.Time;
import java.sql.Timestamp;
import java.util.UUID;

public class MessageThread {
    UUID id;
    Timestamp created_at;

    public MessageThread(UUID id, Timestamp created_at) {
        this.id = id;
        this.created_at = created_at;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
