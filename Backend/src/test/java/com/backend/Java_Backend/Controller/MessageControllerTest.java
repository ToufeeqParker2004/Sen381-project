// MessageControllerTest.java
package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Services.MessageService;
import com.backend.Java_Backend.Services.MessageThreadService;
import com.backend.Java_Backend.Services.ThreadParticipantService;
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
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    @Mock
    private MessageService messageService;

    @Mock
    private MessageThreadService messageThreadService;

    @Mock
    private ThreadParticipantService threadParticipantService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private MessageController messageController;

    private MessageDTO testMessageDTO;
    private MessageThreadDTO testThreadDTO;
    private ThreadParticipantDTO testParticipantDTO;
    private UUID testMessageId;
    private UUID testThreadId;

    @BeforeEach
    void setUp() {
        testMessageId = UUID.randomUUID();
        testThreadId = UUID.randomUUID();

        // Use the actual MessageDTO constructor
        testMessageDTO = new MessageDTO(
                testMessageId,
                1,
                "Test message content",
                Timestamp.from(Instant.now()),
                testThreadId
        );

        testThreadDTO = new MessageThreadDTO();
        testThreadDTO.setThreadId(testThreadId);
        testThreadDTO.setCreated_at(Timestamp.from(Instant.now()));

        testParticipantDTO = new ThreadParticipantDTO();
        testParticipantDTO.setThreadId(testThreadId);
        testParticipantDTO.setStudentId(1);
    }

    // Message Endpoints Tests

    // WB-MSG-01: Test createMessage - successful creation
    @Test
    void createMessage_WithValidData_ShouldCreateMessage() {
        // Arrange
        when(messageService.createMessage(testMessageDTO)).thenReturn(testMessageDTO);

        // Act
        ResponseEntity<MessageDTO> response = messageController.createMessage(testMessageDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testMessageId, response.getBody().getId());
        assertEquals("Test message content", response.getBody().getContent());
        verify(messageService).createMessage(testMessageDTO);
    }

    // WB-MSG-02: Test getMessage - message exists
    @Test
    void getMessage_WhenMessageExists_ShouldReturnMessage() {
        // Arrange
        when(messageService.getMessage(testMessageId)).thenReturn(testMessageDTO);

        // Act
        ResponseEntity<MessageDTO> response = messageController.getMessage(testMessageId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testMessageId, response.getBody().getId());
        assertEquals(1, response.getBody().getSenderId());
        verify(messageService).getMessage(testMessageId);
    }

    // WB-MSG-03: Test getMessagesByThreadId - messages exist
    @Test
    void getMessagesByThreadId_WhenMessagesExist_ShouldReturnMessages() {
        // Arrange
        List<MessageDTO> messages = Arrays.asList(testMessageDTO);
        when(messageService.getMessagesByThreadId(testThreadId)).thenReturn(messages);

        // Act
        ResponseEntity<List<MessageDTO>> response = messageController.getMessagesByThreadId(testThreadId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(testMessageId, response.getBody().get(0).getId());
        verify(messageService).getMessagesByThreadId(testThreadId);
    }

    // WB-MSG-04: Test updateMessage - successful update
    @Test
    void updateMessage_WithValidData_ShouldUpdateMessage() {
        // Arrange
        MessageDTO updatedMessage = new MessageDTO(
                testMessageId,
                1,
                "Updated message content",
                Timestamp.from(Instant.now()),
                testThreadId
        );
        when(messageService.updateMessage(testMessageId, updatedMessage)).thenReturn(updatedMessage);

        // Act
        ResponseEntity<MessageDTO> response = messageController.updateMessage(testMessageId, updatedMessage);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated message content", response.getBody().getContent());
        verify(messageService).updateMessage(testMessageId, updatedMessage);
    }

    // WB-MSG-05: Test deleteMessage - successful deletion
    @Test
    void deleteMessage_ShouldReturnNoContent() {
        // Act
        ResponseEntity<Void> response = messageController.deleteMessage(testMessageId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(messageService).deleteMessage(testMessageId);
    }

    // MessageThread Endpoints Tests

    // WB-MSG-06: Test createThread - successful creation
    @Test
    void createThread_WithValidData_ShouldCreateThread() {
        // Arrange
        when(messageThreadService.createThread(any(MessageThreadDTO.class))).thenReturn(testThreadDTO);

        // Act
        ResponseEntity<MessageThreadDTO> response = messageController.createThread(testThreadDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testThreadId, response.getBody().getThreadId());
        verify(messageThreadService).createThread(any(MessageThreadDTO.class));
    }

    // WB-MSG-07: Test getThread - thread exists
    @Test
    void getThread_WhenThreadExists_ShouldReturnThread() {
        // Arrange
        when(messageThreadService.getThread(testThreadId)).thenReturn(testThreadDTO);

        // Act
        ResponseEntity<MessageThreadDTO> response = messageController.getThread(testThreadId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testThreadId, response.getBody().getThreadId());
        verify(messageThreadService).getThread(testThreadId);
    }

    // WB-MSG-08: Test getAllThreads - threads exist
    @Test
    void getAllThreads_WhenThreadsExist_ShouldReturnThreads() {
        // Arrange
        List<MessageThreadDTO> threads = Arrays.asList(testThreadDTO);
        when(messageThreadService.getAllThreads()).thenReturn(threads);

        // Act
        ResponseEntity<List<MessageThreadDTO>> response = messageController.getAllThreads();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(testThreadId, response.getBody().get(0).getThreadId());
        verify(messageThreadService).getAllThreads();
    }

    // WB-MSG-09: Test updateThread - successful update
    @Test
    void updateThread_WithValidData_ShouldUpdateThread() {
        // Arrange
        when(messageThreadService.updateThread(testThreadId, testThreadDTO)).thenReturn(testThreadDTO);

        // Act
        ResponseEntity<MessageThreadDTO> response = messageController.updateThread(testThreadId, testThreadDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(messageThreadService).updateThread(testThreadId, testThreadDTO);
    }

    // WB-MSG-10: Test deleteThread - successful deletion
    @Test
    void deleteThread_ShouldReturnNoContent() {
        // Act
        ResponseEntity<Void> response = messageController.deleteThread(testThreadId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(messageThreadService).deleteThread(testThreadId);
    }

    // ThreadParticipant Endpoints Tests

    // WB-MSG-11: Test addParticipant - successful addition
    @Test
    void addParticipant_WithValidData_ShouldAddParticipant() {
        // Arrange
        when(threadParticipantService.addParticipant(testParticipantDTO)).thenReturn(testParticipantDTO);

        // Act
        ResponseEntity<ThreadParticipantDTO> response = messageController.addParticipant(testParticipantDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testThreadId, response.getBody().getThreadId());
        assertEquals(1, response.getBody().getStudentId());
        verify(threadParticipantService).addParticipant(testParticipantDTO);
    }

    // WB-MSG-12: Test getParticipantsByThreadId - participants exist
    @Test
    void getParticipantsByThreadId_WhenParticipantsExist_ShouldReturnParticipants() {
        // Arrange
        List<ThreadParticipantDTO> participants = Arrays.asList(testParticipantDTO);
        when(threadParticipantService.getParticipantsByThreadId(testThreadId)).thenReturn(participants);

        // Act
        ResponseEntity<List<ThreadParticipantDTO>> response = messageController.getParticipantsByThreadId(testThreadId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(testThreadId, response.getBody().get(0).getThreadId());
        verify(threadParticipantService).getParticipantsByThreadId(testThreadId);
    }

    // WB-MSG-13: Test getParticipantsByStudentId - participants exist
    @Test
    void getParticipantsByStudentId_WhenParticipantsExist_ShouldReturnParticipants() {
        // Arrange
        List<ThreadParticipantDTO> participants = Arrays.asList(testParticipantDTO);
        when(threadParticipantService.getParticipantsByStudentId(1)).thenReturn(participants);

        // Act
        ResponseEntity<List<ThreadParticipantDTO>> response = messageController.getParticipantsByStudentId(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(1, response.getBody().get(0).getStudentId());
        verify(threadParticipantService).getParticipantsByStudentId(1);
    }

    // WB-MSG-14: Test updateParticipant - successful update
    @Test
    void updateParticipant_WithValidData_ShouldUpdateParticipant() {
        // Arrange
        when(threadParticipantService.updateParticipant(testThreadId, 1, testParticipantDTO)).thenReturn(testParticipantDTO);

        // Act
        ResponseEntity<ThreadParticipantDTO> response = messageController.updateParticipant(testThreadId, 1, testParticipantDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(threadParticipantService).updateParticipant(testThreadId, 1, testParticipantDTO);
    }

    // WB-MSG-15: Test deleteParticipant - successful deletion
    @Test
    void deleteParticipant_ShouldReturnNoContent() {
        // Act
        ResponseEntity<Void> response = messageController.deleteParticipant(testThreadId, 1);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(threadParticipantService).deleteParticipant(testThreadId, 1);
    }

    // WB-MSG-16: Test getThreadsByStudentId - successful retrieval with matching authentication
    @Test
    void getThreadsByStudentId_WithMatchingAuthentication_ShouldReturnThreads() {
        // Arrange
        List<ThreadParticipantDTO> participants = Arrays.asList(testParticipantDTO);
        when(authentication.getName()).thenReturn("1");
        when(threadParticipantService.getParticipantsByStudentId(1)).thenReturn(participants);
        when(messageThreadService.getThread(testThreadId)).thenReturn(testThreadDTO);

        // Act
        ResponseEntity<List<MessageThreadDTO>> response = messageController.getThreadsByStudentId(1, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(testThreadId, response.getBody().get(0).getThreadId());
        verify(threadParticipantService).getParticipantsByStudentId(1);
        verify(messageThreadService).getThread(testThreadId);
    }

    // WB-MSG-17: Test getThreadsByStudentId - authentication mismatch
    @Test
    void getThreadsByStudentId_WithAuthenticationMismatch_ShouldReturnForbidden() {
        // Arrange
        when(authentication.getName()).thenReturn("2"); // Different from path

        // Act
        ResponseEntity<List<MessageThreadDTO>> response = messageController.getThreadsByStudentId(1, authentication);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(threadParticipantService, never()).getParticipantsByStudentId(any());
    }

    // WB-MSG-18: Test getThreadsByStudentId - no participants found
    @Test
    void getThreadsByStudentId_WhenNoParticipants_ShouldReturnEmptyList() {
        // Arrange
        when(authentication.getName()).thenReturn("1");
        when(threadParticipantService.getParticipantsByStudentId(1)).thenReturn(Arrays.asList());

        // Act
        ResponseEntity<List<MessageThreadDTO>> response = messageController.getThreadsByStudentId(1, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(threadParticipantService).getParticipantsByStudentId(1);
    }

    // WB-MSG-19: Test createMessage - null message content
    @Test
    void createMessage_WithNullContent_ShouldHandleGracefully() {
        // Arrange
        MessageDTO messageWithNullContent = new MessageDTO(
                testMessageId,
                1,
                null,
                Timestamp.from(Instant.now()),
                testThreadId
        );
        when(messageService.createMessage(messageWithNullContent)).thenReturn(messageWithNullContent);

        // Act
        ResponseEntity<MessageDTO> response = messageController.createMessage(messageWithNullContent);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNull(response.getBody().getContent());
        verify(messageService).createMessage(messageWithNullContent);
    }

    // WB-MSG-20: Test getMessagesByThreadId - empty thread
    @Test
    void getMessagesByThreadId_WhenNoMessages_ShouldReturnEmptyList() {
        // Arrange
        when(messageService.getMessagesByThreadId(testThreadId)).thenReturn(Arrays.asList());

        // Act
        ResponseEntity<List<MessageDTO>> response = messageController.getMessagesByThreadId(testThreadId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(messageService).getMessagesByThreadId(testThreadId);
    }
}