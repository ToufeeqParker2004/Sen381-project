package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;

public class TopicDTO {
    private int id;
    private int moduleId;
    private int creatorId;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private String title;
    private String description;
    private String status;

    public TopicDTO() {}

    public TopicDTO(int id, int moduleId, int creatorId, Timestamp createdAt, Timestamp updatedAt, String title, String description, String status) {
        this.id = id;
        this.moduleId = moduleId;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.title = title;
        this.description = description;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }

    public int getCreatorId() { return creatorId; }
    public void setCreatorId(int creatorId) { this.creatorId = creatorId; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
