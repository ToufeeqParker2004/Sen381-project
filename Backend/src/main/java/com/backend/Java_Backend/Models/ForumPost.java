package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "forum_posts")
public class ForumPost {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private Integer authorId;

    @Column(name = "parent_post_id")
    private UUID parent_post_id;

    @Column(name = "content")
    private String content;

    @Column(name = "attachments")
    private String[] attachments;

    @Column(name = "upvotes")
    private Integer upvotes;

    @Column(name = "created_at")
    private Timestamp created_at;

    @Column(name = "title")
    private String title;

    @Column(name = "tags")
    private String[] tags;

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String Title) {
        title = Title;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }
    public UUID getParent_post_id() { return parent_post_id; }
    public void setParent_post_id(UUID parent_post_id) { this.parent_post_id = parent_post_id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String[] getAttachments() {
        return attachments;
    }

    public void setAttachments(String[] attachments) {
        this.attachments = attachments;
    }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }
    public Timestamp getCreated_at() { return created_at; }
    public void setCreated_at(Timestamp created_at) { this.created_at = created_at; }
}
