package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "forum_post_id", nullable = false)
    private ForumPost forumPost;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @Column(nullable = false)
    private String content;

    @Column(columnDefinition = "integer default 0")
    private int upvotes;

    @Column(columnDefinition = "integer default 0")
    private int downvotes;

    @Column(name = "created_at", columnDefinition = "timestamp default now()")
    private Timestamp createdAt;

    public Comment() {}

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public ForumPost getForumPost() { return forumPost; }
    public void setForumPost(ForumPost forumPost) { this.forumPost = forumPost; }

    public Comment getParentComment() { return parentComment; }
    public void setParentComment(Comment parentComment) { this.parentComment = parentComment; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
