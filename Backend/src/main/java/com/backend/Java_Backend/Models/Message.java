package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class Message {
    UUID id;
    UUID thread_id;
    int sender_id;
    String message_text;
    String[] attatchments;
    Timestamp created_at;

    public Message(UUID id, UUID thread_id, int sender_id, String message_text, String[] attatchments, Timestamp created_at) {
        this.id = id;
        this.thread_id = thread_id;
        this.sender_id = sender_id;
        this.message_text = message_text;
        this.attatchments = attatchments;
        this.created_at = created_at;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getThread_id() {
        return thread_id;
    }

    public void setThread_id(UUID thread_id) {
        this.thread_id = thread_id;
    }

    public int getSender_id() {
        return sender_id;
    }

    public void setSender_id(int sender_id) {
        this.sender_id = sender_id;
    }

    public String getMessage_text() {
        return message_text;
    }

    public void setMessage_text(String message_text) {
        this.message_text = message_text;
    }

    public String[] getAttatchments() {
        return attatchments;
    }

    public void setAttatchments(String[] attatchments) {
        this.attatchments = attatchments;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
