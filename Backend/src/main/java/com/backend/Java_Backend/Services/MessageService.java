package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepo;

    public MessageService(MessageRepository messageRepo) {
        this.messageRepo = messageRepo;
    }

    public Message sendMessage(UUID threadID, Long senderId, String content) {
        Message msg = new Message();
        msg.setThreadID(threadID);
        msg.setSenderId(senderId);
        msg.setContent(content);
        msg.setTimestamp(Timestamp.from(Instant.now()));
        return messageRepo.save(msg);
    }
}

