// ForumControllerTest.java
package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.NLP_Moderation.ModerationService;
import com.backend.Java_Backend.Services.ForumPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForumControllerTest {

    @Mock
    private ForumPostService forumPostService;

    @Mock
    private ModerationService moderationService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ForumController forumController;

    private ForumPost testForumPost;
    private UUID testPostId;

    @BeforeEach
    void setUp() {
        testPostId = UUID.randomUUID();
        testForumPost = new ForumPost();
        testForumPost.setId(testPostId);
        testForumPost.setContent("Test forum post content");
        testForumPost.setAuthorId(1);
        testForumPost.setCreated_at(Timestamp.from(Instant.now()));
    }

    // WB-FOR-01: Test getAllForumPosts - successful retrieval
    @Test
    void getAllForumPosts_ShouldReturnListOfPosts() {
        // Arrange
        List<ForumPost> posts = Arrays.asList(testForumPost);
        when(forumPostService.getAllForumPosts()).thenReturn(posts);

        // Act
        ResponseEntity<List<ForumPost>> response = forumController.getAllForumPosts();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(forumPostService).getAllForumPosts();
    }

    // WB-FOR-02: Test getForumPostById - post exists
    @Test
    void getForumPostById_WhenPostExists_ShouldReturnPost() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.of(testForumPost));

        // Act
        ResponseEntity<ForumPost> response = forumController.getForumPostById(testPostId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testPostId, response.getBody().getId());
        verify(forumPostService).getForumPostById(testPostId);
    }

    // WB-FOR-03: Test getForumPostById - post not found
    @Test
    void getForumPostById_WhenPostNotFound_ShouldReturnNotFound() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<ForumPost> response = forumController.getForumPostById(testPostId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(forumPostService).getForumPostById(testPostId);
    }

    // WB-FOR-04: Test createForumPost - successful creation with moderation approval
    @Test
    void createForumPost_WithValidContentAndAuthentication_ShouldCreatePost() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("1");
        when(moderationService.isPostAllowed(testForumPost.getContent())).thenReturn(true);
        when(forumPostService.saveForumPost(any(ForumPost.class))).thenReturn(testForumPost);

        // Act
        ResponseEntity<?> response = forumController.createForumPost(testForumPost, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof ForumPost);
        verify(moderationService).isPostAllowed(testForumPost.getContent());
        verify(forumPostService).saveForumPost(any(ForumPost.class));
    }

    // WB-FOR-05: Test createForumPost - content blocked by moderation
    @Test
    void createForumPost_WithInappropriateContent_ShouldReturnForbidden() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("1");
        when(moderationService.isPostAllowed(testForumPost.getContent())).thenReturn(false);

        // Act
        ResponseEntity<?> response = forumController.createForumPost(testForumPost, authentication);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Post blocked by moderation due to inappropriate content", body.get("error"));
        verify(moderationService).isPostAllowed(testForumPost.getContent());
        verify(forumPostService, never()).saveForumPost(any());
    }

    // WB-FOR-06: Test createForumPost - invalid authentication principal
    @Test
    void createForumPost_WithInvalidPrincipal_ShouldReturnForbidden() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("invalid");

        // Act
        ResponseEntity<?> response = forumController.createForumPost(testForumPost, authentication);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Only students and tutors can create forum posts", body.get("error"));
        verify(forumPostService, never()).saveForumPost(any());
    }

    // WB-FOR-07: Test updateForumPost - successful update
    @Test
    void updateForumPost_WhenPostExistsAndContentAllowed_ShouldUpdatePost() {
        // Arrange
        ForumPost updatedPost = new ForumPost();
        updatedPost.setContent("Updated content");

        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.of(testForumPost));
        when(moderationService.isPostAllowed(updatedPost.getContent())).thenReturn(true);
        when(forumPostService.saveForumPost(any(ForumPost.class))).thenReturn(updatedPost);

        // Act
        ResponseEntity<?> response = forumController.updateForumPost(testPostId, updatedPost);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(forumPostService).getForumPostById(testPostId);
        verify(moderationService).isPostAllowed(updatedPost.getContent());
        verify(forumPostService).saveForumPost(any(ForumPost.class));
    }

    // WB-FOR-08: Test updateForumPost - post not found
    @Test
    void updateForumPost_WhenPostNotFound_ShouldReturnNotFound() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = forumController.updateForumPost(testPostId, testForumPost);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(forumPostService).getForumPostById(testPostId);
        verify(forumPostService, never()).saveForumPost(any());
    }

    // WB-FOR-09: Test updateForumPost - content blocked by moderation
    @Test
    void updateForumPost_WithInappropriateContent_ShouldReturnForbidden() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.of(testForumPost));
        when(moderationService.isPostAllowed(testForumPost.getContent())).thenReturn(false);

        // Act
        ResponseEntity<?> response = forumController.updateForumPost(testPostId, testForumPost);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(moderationService).isPostAllowed(testForumPost.getContent());
        verify(forumPostService, never()).saveForumPost(any());
    }

    // WB-FOR-10: Test deleteForumPost - successful deletion
    @Test
    void deleteForumPost_WhenPostExists_ShouldReturnNoContent() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.of(testForumPost));

        // Act
        ResponseEntity<?> response = forumController.deleteForumPost(testPostId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(forumPostService).getForumPostById(testPostId);
        verify(forumPostService).deleteForumPost(testPostId);
    }

    // WB-FOR-11: Test deleteForumPost - post not found
    @Test
    void deleteForumPost_WhenPostNotFound_ShouldReturnNotFound() {
        // Arrange
        when(forumPostService.getForumPostById(testPostId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = forumController.deleteForumPost(testPostId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(forumPostService).getForumPostById(testPostId);
        verify(forumPostService, never()).deleteForumPost(testPostId);
    }
}
