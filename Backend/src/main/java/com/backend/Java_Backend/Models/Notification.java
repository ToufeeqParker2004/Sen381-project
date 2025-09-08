package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class Notification {
    UUID id;
    int user_id;
    String message;
    String notification_type;
    String status;
    Timestamp created_at;

    public Notification(UUID id, int user_id, String message, String notification_type, String status, Timestamp created_at) {
        this.id = id;
        this.user_id = user_id;
        this.message = message;
        this.notification_type = notification_type;
        this.status = status;
        this.created_at = created_at;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getNotification_type() {
        return notification_type;
    }

    public void setNotification_type(String notification_type) {
        this.notification_type = notification_type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
