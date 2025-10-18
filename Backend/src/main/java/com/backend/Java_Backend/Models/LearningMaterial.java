package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "learning_materials")
public class LearningMaterial {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "topic_id")
    private Integer topic_id; // Changed to Integer to allow null

    @Column(name = "module_id")
    private Integer module_id; // Changed to Integer to allow null

    @Column(name = "uploader_id")
    private Integer uploader_id;

    @Column(name = "title")
    private String title;

    @Column(name = "document_type")
    private String document_type;

    @Column(name = "file_url")
    private String file_url;

    @Column(name = "created_at")
    private Timestamp created_at;

    @Column(name = "tags")
    private String[] tags;

    // Default constructor
    public LearningMaterial() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getTopic_id() {
        return topic_id;
    }

    public void setTopic_id(Integer topic_id) {
        this.topic_id = topic_id;
    }

    public Integer getModule_id() {
        return module_id;
    }

    public void setModule_id(Integer module_id) {
        this.module_id = module_id;
    }

    public Integer getUploader_id() {
        return uploader_id;
    }

    public void setUploader_id(Integer uploader_id) {
        this.uploader_id = uploader_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDocument_type() {
        return document_type;
    }

    public void setDocument_type(String document_type) {
        this.document_type = document_type;
    }

    public String getFile_url() {
        return file_url;
    }

    public void setFile_url(String file_url) {
        this.file_url = file_url;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }
}
