package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.UUID;
@Entity
@Table(name = "forum_posts")
public class ForumPost {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    UUID id;
    @Column(name = "author_id")
    int authorId;
    UUID parent_post_id;
    String content;
    @Column(name = "attachments")
    String[] attatchments;
    int upvotes;
    Timestamp created_at;

    public ForumPost() {}

    public ForumPost(UUID id, int authorId, UUID parent_post_id, String content, String[] attatchments, int upvotes, Timestamp creted_at) {
        this.id = id;
        this.authorId = authorId;
        this.parent_post_id = parent_post_id;
        this.content = content;
        this.attatchments = attatchments;
        this.upvotes = upvotes;
        this.created_at = creted_at;
    }

    public UUID getId() {
        return id;
    }



    public int getAuthorId() {
        return authorId;
    }

    public void setAuthorId(int authorId) {
        this.authorId = authorId;
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

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
