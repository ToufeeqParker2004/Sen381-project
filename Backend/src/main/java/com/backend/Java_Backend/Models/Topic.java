package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Timestamp;
@Entity
@Table(name = "topics")
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    int module_id;
    int creator_id;
    Timestamp created_at;
    Timestamp updated_at;
    String title;
    String description;
    String status;

    public Topic() {}

    public Topic( int module_id, int creator_id, Timestamp created_at, Timestamp updated_at, String title, String description, String status) {

        this.module_id = module_id;
        this.creator_id = creator_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.title = title;
        this.description = description;
        this.status = status;
    }

    public int getId() {
        return id;
    }



    public int getModule_id() {
        return module_id;
    }

    public void setModule_id(int module_id) {
        this.module_id = module_id;
    }

    public int getCreator_id() {
        return creator_id;
    }

    public void setCreator_id(int creator_id) {
        this.creator_id = creator_id;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public Timestamp getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(Timestamp updated_at) {
        this.updated_at = updated_at;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
