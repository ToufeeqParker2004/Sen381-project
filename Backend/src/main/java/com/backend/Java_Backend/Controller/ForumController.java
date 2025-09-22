package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.NLP_Moderation.ModerationService;
import com.backend.Java_Backend.Services.ForumPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/ForumPosts")
public class ForumController {
    private final ForumPostService forumPostService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    public ForumController(ForumPostService forumPostService) {
        this.forumPostService = forumPostService;
    }
    @Autowired
    private ModerationService moderationService;

    // Get all Forum Posts
    @GetMapping
    public List<ForumPost> getAllForumPosts() {
        return forumPostService.getAllForumPosts();
    }

    // Get Forum Post by ID
    @GetMapping("/{id}")
    public ResponseEntity<ForumPost> getForumPostById(@PathVariable UUID id) {
        Optional<ForumPost> forumnPost = forumPostService.getForumPostById(id);
        return forumnPost.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new Forum Post
    @PostMapping
    public ResponseEntity<?> createForumPost(@RequestBody ForumPost forumPost) {
        forumPost.setCreated_at(Timestamp.from(Instant.now()));
        boolean allowed = moderationService.isPostAllowed(forumPost.getContent());

        if (!allowed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Post blocked by moderation due to inappropriate content.");
        }

        ForumPost savedPost = forumPostService.saveForumPost(forumPost);
        return ResponseEntity.ok(savedPost);
    }

    // Update Forum Post
    @PutMapping("/{id}")
    public ResponseEntity<ForumPost> updateForumPost(@PathVariable UUID id, @RequestBody ForumPost updatedPost) {
        return forumPostService.getForumPostById(id).map(forumPost -> {
            forumPost.setAuthorId(updatedPost.getAuthorId());
            forumPost.setParent_post_id(updatedPost.getParent_post_id());
            forumPost.setContent(updatedPost.getContent());
            forumPost.setAttatchments(updatedPost.getAttatchments());
            forumPost.setUpvotes(updatedPost.getUpvotes());
            forumPost.setCreated_at(Timestamp.from(Instant.now()));
            return ResponseEntity.ok(forumPostService.saveForumPost(forumPost));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete Forum Post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForumPost(@PathVariable UUID id) {
        if (forumPostService.getForumPostById(id).isPresent()) {
            forumPostService.deleteForumPost(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
