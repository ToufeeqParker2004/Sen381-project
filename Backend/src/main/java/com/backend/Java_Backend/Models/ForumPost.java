package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class ForumPost {
    UUID id;
    int author_id;
    UUID parent_post_id;
    String content;
    String[] attatchments;
    int upvotes;
    Timestamp creted_at;

    public ForumPost(UUID id, int author_id, UUID parent_post_id, String content, String[] attatchments, int upvotes, Timestamp creted_at) {
        this.id = id;
        this.author_id = author_id;
        this.parent_post_id = parent_post_id;
        this.content = content;
        this.attatchments = attatchments;
        this.upvotes = upvotes;
        this.creted_at = creted_at;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getAuthor_id() {
        return author_id;
    }

    public void setAuthor_id(int author_id) {
        this.author_id = author_id;
    }

    public UUID getParent_post_id() {
        return parent_post_id;
    }

    public void setParent_post_id(UUID parent_post_id) {
        this.parent_post_id = parent_post_id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String[] getAttatchments() {
        return attatchments;
    }

    public void setAttatchments(String[] attatchments) {
        this.attatchments = attatchments;
    }

    public int getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }

    public Timestamp getCreted_at() {
        return creted_at;
    }

    public void setCreted_at(Timestamp creted_at) {
        this.creted_at = creted_at;
    }
}
