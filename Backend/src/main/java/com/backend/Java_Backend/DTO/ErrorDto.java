package com.backend.Java_Backend.DTO;

import java.time.ZonedDateTime;
import java.util.UUID;

public class ErrorDto {

    private UUID id;
    private ZonedDateTime createdAt;
    private String message;
    private String stackTrace;
    private String endpoint;
    private Long userId;
    private String additionalInfo;

    // Constructors, Getters, Setters
    public ErrorDto() {}

    public ErrorDto(UUID id, ZonedDateTime createdAt, String message, String stackTrace, String endpoint, Long userId, String additionalInfo) {
        this.id = id;
        this.createdAt = createdAt;
        this.message = message;
        this.stackTrace = stackTrace;
        this.endpoint = endpoint;
        this.userId = userId;
        this.additionalInfo = additionalInfo;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
}
