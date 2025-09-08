package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class LearningMaterial {
    UUID id;
    int topic_id;
    int module_id;
    int uploader_id;
    String title;
    String document_type;
    String file_url;
    Timestamp created_at;
    String[] tags;

    public LearningMaterial(UUID id, int topic_id, int module_id, int uploader_id, String title, String document_type, String file_url, Timestamp created_at, String[] tags) {
        this.id = id;
        this.topic_id = topic_id;
        this.module_id = module_id;
        this.uploader_id = uploader_id;
        this.title = title;
        this.document_type = document_type;
        this.file_url = file_url;
        this.created_at = created_at;
        this.tags = tags;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getTopic_id() {
        return topic_id;
    }

    public void setTopic_id(int topic_id) {
        this.topic_id = topic_id;
    }

    public int getModule_id() {
        return module_id;
    }

    public void setModule_id(int module_id) {
        this.module_id = module_id;
    }

    public int getUploader_id() {
        return uploader_id;
    }

    public void setUploader_id(int uploader_id) {
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
