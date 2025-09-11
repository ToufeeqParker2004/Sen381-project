package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Repository.MessageRepository;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepo;
    private final MessageThreadRepository threadRepo;
    public MessageService(MessageRepository messageRepo,MessageThreadRepository threadRepo) {
        this.messageRepo = messageRepo;
        this.threadRepo = threadRepo;
    }

    public Message sendMessage(MessageThread threadID, Long senderId, String content) {
        Message msg = new Message();
        msg.setThread(threadID);
        msg.setSenderId(senderId);
        msg.setContent(content);
        msg.setTimestamp(Timestamp.from(Instant.now()));
        return messageRepo.save(msg);
    }
    public Optional<Message> createMessage(Message message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(new Timestamp(System.currentTimeMillis()));
        }

        if (message.getThread() == null || message.getThread().getThreadId() == null) {
            return Optional.empty();
        }

        Optional<MessageThread> threadOpt = threadRepo.findById(message.getThread().getThreadId());
        if (threadOpt.isEmpty()) return Optional.empty();

        message.setThread(threadOpt.get());
        return Optional.of(messageRepo.save(message));
    }

    public List<Message> getAllMessages() {
        return messageRepo.findAll();
    }

    public Optional<Message> getMessageById(UUID id) {
        return messageRepo.findById(id);
    }

    public List<Message> getMessagesByThreadId(UUID threadId) {
        return messageRepo.findByThread_ThreadId(threadId);
    }

    public Optional<Message> updateMessage(UUID id, Message updated) {
        return messageRepo.findById(id).map(existing -> {
            if (updated.getContent() != null) existing.setContent(updated.getContent());
            if (updated.getSenderId() != null) existing.setSenderId(updated.getSenderId());
            return messageRepo.save(existing);
        });
    }

    public boolean deleteMessage(UUID id) {
        if (!messageRepo.existsById(id)) return false;
        messageRepo.deleteById(id);
        return true;
    }
}

