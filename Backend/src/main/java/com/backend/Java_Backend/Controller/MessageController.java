package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Services.MessageThreadService;
import com.backend.Java_Backend.Services.MessageService;
import com.backend.Java_Backend.Services.ThreadParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/threads")
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
    public MessageThread createThread(@RequestParam String title) {
        return threadService.createThread(title);
    }

    @PostMapping("/{threadID}/participants")
    public ThreadParticipant addParticipant(@PathVariable UUID threadID,
                                            @RequestParam Long userId) {
        return participantService.addParticipant(threadID, userId);
    }

    // Send message
    @PostMapping("/{threadID}/messages")
    public Message sendMessage(@PathVariable UUID threadID,
                               @RequestParam Long senderId,
                               @RequestParam String content) {
        return messageService.sendMessage(threadID, senderId, content);
    }

    // Get thread with messages and participants
    @GetMapping("/{threadID}")
    public ResponseEntity<?> getThread(@PathVariable UUID threadID) {
        Optional<MessageThread> threadOpt = threadService.getThread(threadID);
        if (threadOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MessageThread thread = threadOpt.get();
        List<Message> messages = threadService.getMessages(threadID);
        List<ThreadParticipant> participants = threadService.getParticipants(threadID);

        Map<String, Object> response = new HashMap<>();
        response.put("thread", thread);
        response.put("messages", messages);
        response.put("participants", participants);

        return ResponseEntity.ok(response);
    }
}

