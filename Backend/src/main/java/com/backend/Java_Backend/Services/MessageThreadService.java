package com.backend.Java_Backend.Services;


import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Repository.MessageRepository;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import com.backend.Java_Backend.Repository.ThreadParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MessageThreadService {

    private final com.backend.Java_Backend.Repository.MessageThreadRepository threadRepo;
    private final com.backend.Java_Backend.Repository.MessageRepository messageRepo;
    private final com.backend.Java_Backend.Repository.ThreadParticipantRepository participantRepo;

    public MessageThreadService(MessageThreadRepository threadRepo,
                                MessageRepository messageRepo,
                                ThreadParticipantRepository participantRepo) {
        this.threadRepo = threadRepo;
        this.messageRepo = messageRepo;
        this.participantRepo = participantRepo;
    }

    public MessageThread createThread(String title) {
        MessageThread thread = new MessageThread();
        thread.setThreadID(UUID.randomUUID());
        thread.setTitle(title);
        return threadRepo.save(thread);
    }

    public Optional<MessageThread> getThread(UUID threadID) {
        return threadRepo.findById(threadID);
    }

    public List<Message> getMessages(UUID threadID) {
        return messageRepo.findByThreadID(threadID);
    }

    public List<ThreadParticipant> getParticipants(UUID threadID) {
        return participantRepo.findByThreadID(threadID);
    }
}


