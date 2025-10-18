package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.UUID;

public class LearningMaterialDTO {
    private UUID id;
    private Integer topicId; // Changed to Integer
    private Integer moduleId; // Changed to Integer
    private Integer uploaderId;
    private String title;
    private String documentType;
    private String fileUrl;
    private Timestamp createdAt;
    private String[] tags;
    private TutorDetailsDTO uploaderDetails;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }

    public Integer getModuleId() {
        return moduleId;
    }

    public void setModuleId(Integer moduleId) {
        this.moduleId = moduleId;
    }

    public Integer getUploaderId() {
        return uploaderId;
    }

    public void setUploaderId(Integer uploaderId) {
        this.uploaderId = uploaderId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public TutorDetailsDTO getUploaderDetails() {
        return uploaderDetails;
    }

    public void setUploaderDetails(TutorDetailsDTO uploaderDetails) {
        this.uploaderDetails = uploaderDetails;
    }
}