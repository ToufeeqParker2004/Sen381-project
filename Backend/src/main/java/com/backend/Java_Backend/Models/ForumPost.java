package com.backend.Java_Backend.Models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "forum_posts")
public class ForumPost {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    @Column(name = "author_id")
    @JsonProperty("author_id")
    private Integer authorId; // Use Integer to allow null

    @Column(name = "parent_post_id")
    @JsonProperty("parent_post_id")
    private UUID parentPostId; // nullable

    private String content;

    @Column(name = "attachments")
    private String[] attachments; // nullable

    private int upvotes;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Timestamp createdAt;

    public ForumPost() {}

    // Getters & Setters
    public UUID getId() { return id; }

    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }

    public UUID getParentPostId() { return parentPostId; }
    public void setParentPostId(UUID parentPostId) { this.parentPostId = parentPostId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String[] getAttachments() { return attachments; }
    public void setAttachments(String[] attachments) { this.attachments = attachments; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
