package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Comment;
import com.backend.Java_Backend.Models.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByForumPostId(UUID postId);
}
