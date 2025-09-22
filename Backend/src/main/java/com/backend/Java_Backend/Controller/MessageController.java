package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.MessageDTO;
import com.backend.Java_Backend.DTO.MessageThreadDTO;
import com.backend.Java_Backend.DTO.ThreadParticipantDTO;
import com.backend.Java_Backend.Services.MessageService;
import com.backend.Java_Backend.Services.MessageThreadService;
import com.backend.Java_Backend.Services.ThreadParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/messaging")
public class MessageController {
    private final MessageService messageService;
    private final MessageThreadService messageThreadService;
    private final ThreadParticipantService threadParticipantService;

    public MessageController(MessageService messageService, MessageThreadService messageThreadService, ThreadParticipantService threadParticipantService) {
        this.messageService = messageService;
        this.messageThreadService = messageThreadService;
        this.threadParticipantService = threadParticipantService;
    }

    // Message Endpoints
    //posting a messasage in DTO format
    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> createMessage(@RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.createMessage(messageDTO));
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable UUID id) {
        return ResponseEntity.ok(messageService.getMessage(id));
    }

    @GetMapping("/messages/thread/{threadId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByThreadId(@PathVariable UUID threadId) {
        return ResponseEntity.ok(messageService.getMessagesByThreadId(threadId));
    }

    @PutMapping("/messages/{id}")
    public ResponseEntity<MessageDTO> updateMessage(@PathVariable UUID id, @RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.updateMessage(id, messageDTO));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    // MessageThread Endpoints
    @PostMapping("/threads")
    public ResponseEntity<MessageThreadDTO> createThread(@RequestBody MessageThreadDTO threadDTO) {
        threadDTO.setThreadId(UUID.randomUUID());
        threadDTO.setCreated_at(Timestamp.from(Instant.now()));
        return ResponseEntity.ok(messageThreadService.createThread(threadDTO));
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<MessageThreadDTO> getThread(@PathVariable UUID threadId) {
        return ResponseEntity.ok(messageThreadService.getThread(threadId));
    }

    @GetMapping("/threads")
    public ResponseEntity<List<MessageThreadDTO>> getAllThreads() {
        return ResponseEntity.ok(messageThreadService.getAllThreads());
    }

    @PutMapping("/threads/{threadId}")
    public ResponseEntity<MessageThreadDTO> updateThread(@PathVariable UUID threadId, @RequestBody MessageThreadDTO threadDTO) {
        threadDTO.setCreated_at(Timestamp.from(Instant.now()));
        return ResponseEntity.ok(messageThreadService.updateThread(threadId, threadDTO));
    }

    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<Void> deleteThread(@PathVariable UUID threadId) {
        messageThreadService.deleteThread(threadId);
        return ResponseEntity.noContent().build();
    }

    // ThreadParticipant Endpoints
    @PostMapping("/participants")
    public ResponseEntity<ThreadParticipantDTO> addParticipant(@RequestBody ThreadParticipantDTO participantDTO) {

        return ResponseEntity.ok(threadParticipantService.addParticipant(participantDTO));
    }

    @GetMapping("/participants/thread/{threadId}")
    public ResponseEntity<List<ThreadParticipantDTO>> getParticipantsByThreadId(@PathVariable UUID threadId) {
        return ResponseEntity.ok(threadParticipantService.getParticipantsByThreadId(threadId));
    }

    @GetMapping("/participants/student/{studentId}")
    public ResponseEntity<List<ThreadParticipantDTO>> getParticipantsByStudentId(@PathVariable Integer studentId) {
        return ResponseEntity.ok(threadParticipantService.getParticipantsByStudentId(studentId));
    }

    @PutMapping("/participants/{threadId}/{studentId}")
    public ResponseEntity<ThreadParticipantDTO> updateParticipant(@PathVariable UUID threadId, @PathVariable Integer studentId, @RequestBody ThreadParticipantDTO participantDTO) {
        return ResponseEntity.ok(threadParticipantService.updateParticipant(threadId, studentId, participantDTO));
    }

    @DeleteMapping("/participants/{threadId}/{studentId}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable UUID threadId, @PathVariable Integer studentId) {
        threadParticipantService.deleteParticipant(threadId, studentId);
        return ResponseEntity.noContent().build();
    }
}

