package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.NLP_Moderation.ModerationService;
import com.backend.Java_Backend.Services.ForumPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
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
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<ForumPost>> getAllForumPosts() {
        List<ForumPost> posts = forumPostService.getAllForumPosts();
        return ResponseEntity.ok(posts);
    }

    // Get Forum Post by ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ForumPost> getForumPostById(@PathVariable UUID id) {
        Optional<ForumPost> forumPost = forumPostService.getForumPostById(id);
        return forumPost.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new Forum Post
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<?> createForumPost(@RequestBody ForumPost forumPost, Authentication authentication) {
        try {
            String principal = (String) authentication.getPrincipal();
            int authorId = Integer.parseInt(principal); // Student or tutor ID
            forumPost.setAuthorId(authorId);
            forumPost.setCreated_at(Timestamp.from(Instant.now()));
            boolean allowed = moderationService.isPostAllowed(forumPost.getContent());

            if (!allowed) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("error", "Post blocked by moderation"));
            }

            ForumPost savedPost = forumPostService.saveForumPost(forumPost);
            return ResponseEntity.ok(savedPost);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Only students and tutors can create forum posts"));
        }
    }

    // Update Forum Post
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'ForumPost', 'own')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateForumPost(@PathVariable UUID id, @RequestBody ForumPost updatedPost) {
        Optional<ForumPost> forumPostOpt = forumPostService.getForumPostById(id);
        if (forumPostOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Forum post not found"));
        }
        boolean allowed = moderationService.isPostAllowed(updatedPost.getContent());
        if (!allowed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Updated post blocked by moderation"));
        }
        ForumPost forumPost = forumPostOpt.get();
        forumPost.setAuthorId(updatedPost.getAuthorId());
        forumPost.setParent_post_id(updatedPost.getParent_post_id());
        forumPost.setContent(updatedPost.getContent());
        forumPost.setAttachments(updatedPost.getAttachments());
        forumPost.setUpvotes(updatedPost.getUpvotes());
        forumPost.setCreated_at(Timestamp.from(Instant.now()));
        return ResponseEntity.ok(forumPostService.saveForumPost(forumPost));
    }

    // Delete Forum Post
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'ForumPost', 'own')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteForumPost(@PathVariable UUID id) {
        if (forumPostService.getForumPostById(id).isPresent()) {
            forumPostService.deleteForumPost(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "Forum post not found"));
    }
}
