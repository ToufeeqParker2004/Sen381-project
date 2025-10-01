package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.DTOMapper;
import com.backend.Java_Backend.DTO.MessageDTO;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Repository.MessageRepository;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final DTOMapper dtoMapper;

    public MessageService(MessageRepository messageRepository, MessageThreadRepository messageThreadRepository, DTOMapper dtoMapper) {
        this.messageRepository = messageRepository;
        this.messageThreadRepository = messageThreadRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional
    public MessageDTO createMessage(MessageDTO messageDTO) {
        Message message = dtoMapper.toMessageEntity(messageDTO);
        message.setTimestamp(Timestamp.from(Instant.now()));
        messageThreadRepository.findById(messageDTO.getThreadId())
                .ifPresentOrElse(
                        thread -> {
                            message.setThread(thread);
                            thread.setCreated_at(Timestamp.from(Instant.now())); // Update thread timestamp
                            messageThreadRepository.save(thread);
                        },
                        () -> { throw new IllegalArgumentException("Thread not found"); }
                );
        Message saved = messageRepository.save(message);
        return dtoMapper.toMessageDTO(saved);
    }

    public MessageDTO getMessage(UUID id) {
        return messageRepository.findById(id)
                .map(dtoMapper::toMessageDTO)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    public List<MessageDTO> getMessagesByThreadId(UUID threadId) {
        return messageRepository.findByThread_ThreadId(threadId)
                .stream()
                .map(dtoMapper::toMessageDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO updateMessage(UUID id, MessageDTO messageDTO) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setContent(messageDTO.getContent());
        message.setSenderId(messageDTO.getSenderId());
        if (messageDTO.getThreadId() != null && !messageDTO.getThreadId().equals(message.getThreadId())) {
            messageThreadRepository.findById(messageDTO.getThreadId())
                    .ifPresentOrElse(
                            message::setThread,
                            () -> { throw new IllegalArgumentException("Thread not found"); }
                    );
        }
        Message updated = messageRepository.save(message);
        return dtoMapper.toMessageDTO(updated);
    }

    @Transactional
    public void deleteMessage(UUID id) {
        if (!messageRepository.existsById(id)) {
            throw new IllegalArgumentException("Message not found");
        }
        messageRepository.deleteById(id);
    }
}

