package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
    Optional<ForumPost> findByAuthorId(int authorId);
}
