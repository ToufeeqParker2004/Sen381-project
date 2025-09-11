package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Services.MessageThreadService;
import com.backend.Java_Backend.Services.MessageService;
import com.backend.Java_Backend.Services.ThreadParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/threads")
public class MessageController {

    private final MessageThreadService threadService;
    private final MessageService messageService;
    private final ThreadParticipantService participantService;

    public MessageController(MessageThreadService threadService,
                             MessageService messageService,
                             ThreadParticipantService participantService) {
        this.threadService = threadService;
        this.messageService = messageService;
        this.participantService = participantService;
    }

    // Create a new thread
    @PostMapping
    public MessageThread createThread() {
        return threadService.createThread();
    }

    @PostMapping("/{threadID}/participants")
    public ThreadParticipant addParticipant(@PathVariable UUID threadID,
                                            @RequestParam int userId) {
        return participantService.addParticipant(threadID, userId);
    }

    // Create message
    @PostMapping("/{threadId}/messages")
    public ResponseEntity<Message> createMessage(@RequestBody Message message) {
        return messageService.createMessage(message)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    // Get all messages
    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    // Get message by ID
    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable UUID id) {
        return messageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get messages by threadId
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<List<Message>> getMessagesByThreadId(@PathVariable UUID threadId) {
        List<Message> messages = messageService.getMessagesByThreadId(threadId);
        if (messages.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(messages);
    }

    // Update message
    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable UUID id, @RequestBody Message updated) {
        return messageService.updateMessage(id, updated)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete message
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        boolean deleted = messageService.deleteMessage(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

}

