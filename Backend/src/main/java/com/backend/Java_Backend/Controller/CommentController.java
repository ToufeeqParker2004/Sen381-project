package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Comment;
import com.backend.Java_Backend.NLP_Moderation.ModerationService;
import com.backend.Java_Backend.Services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }
    @Autowired
    private ModerationService moderationService;


    // Get all comments for a post
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable UUID postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Add a comment using the logged-in student
    @PostMapping("/post/{postId}/add")
    public ResponseEntity<?> addComment(
            @PathVariable UUID postId,
            @RequestBody String content,
            Authentication authentication
    ) {
        try {
            int studentId = Integer.parseInt((String) authentication.getPrincipal());
            boolean allowed = moderationService.isPostAllowed(content);

            if (!allowed) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("error", "Comment blocked by moderation"));
            }
            Comment comment = commentService.addComment(postId, studentId, content);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }
}
