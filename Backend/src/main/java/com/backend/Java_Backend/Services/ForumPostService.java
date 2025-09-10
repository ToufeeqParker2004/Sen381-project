package com.backend.Java_Backend.Services;


import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.Repository.ForumPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ForumPostService {
    private final ForumPostRepository ForumPostRepository;

    @Autowired
    public ForumPostService(ForumPostRepository ForumPostRepository) {
        this.ForumPostRepository = ForumPostRepository;
    }

    // Get all Forum Posts
    public List<ForumPost> getAllForumPosts() {
        return ForumPostRepository.findAll();
    }

    // Get a Forum Post by ID
    public Optional<ForumPost> getForumPostById(UUID id) {
        return ForumPostRepository.findById(id);
    }

    // Save or update a Forum Post
    public ForumPost saveForumPost(ForumPost student) {
        return ForumPostRepository.save(student);
    }

    // Delete a Forum Post by ID
    public void deleteForumPost(UUID id) {
        ForumPostRepository.deleteById(id);
    }


}
