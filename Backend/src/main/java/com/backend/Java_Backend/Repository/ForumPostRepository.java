package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
    ForumPost findbyAuthorId(int author_id);
}
