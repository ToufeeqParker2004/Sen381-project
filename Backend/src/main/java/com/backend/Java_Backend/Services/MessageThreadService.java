package com.backend.Java_Backend.Services;


import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Repository.MessageRepository;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import com.backend.Java_Backend.Repository.ThreadParticipantRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
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

    public MessageThread createThread() {
        MessageThread thread = new MessageThread();
        thread.setThreadId(UUID.randomUUID());
        thread.setCreated_at(Timestamp.valueOf(java.time.LocalDateTime.now()));
        return threadRepo.save(thread);
    }

    public Optional<MessageThread> getThread(UUID threadID) {
        return threadRepo.findById(threadID);
    }

    public List<Message> getMessages(UUID threadID) {
        return messageRepo.findByThread_ThreadId(threadID);
    }

    public Optional<ThreadParticipant> getParticipants(UUID threadID,Integer studentId) {
        return participantRepo.findById_ThreadIdAndId_StudentId(threadID,studentId);
    }
    public MessageThread createThread(MessageThread thread) {
        return threadRepo.save(thread);
    }

    public Optional<MessageThread> getThreadById(UUID threadId) {
        return threadRepo.findByThreadId(threadId);
    }

    public List<MessageThread> getAllThreads() {
        return threadRepo.findAll();
    }

    public boolean deleteThread(UUID threadId) {
        if (!threadRepo.existsById(threadId)) return false;
        threadRepo.deleteById(threadId);
        return true;
    }


}


