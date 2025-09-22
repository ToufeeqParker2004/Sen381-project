package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.MessageThreadDTO;
import com.backend.Java_Backend.DTO.DTOMapper;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageThreadService {
    private final MessageThreadRepository messageThreadRepository;
    private final DTOMapper dtoMapper;

    public MessageThreadService(MessageThreadRepository messageThreadRepository, DTOMapper dtoMapper) {
        this.messageThreadRepository = messageThreadRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional
    public MessageThreadDTO createThread(MessageThreadDTO threadDTO) {
        MessageThread thread = dtoMapper.toMessageThreadEntity(threadDTO);
        thread.setThreadId(UUID.randomUUID());
        thread.setCreated_at(Timestamp.from(Instant.now()));
        MessageThread saved = messageThreadRepository.save(thread);
        return dtoMapper.toMessageThreadDTO(saved);
    }

    public MessageThreadDTO getThread(UUID threadId) {
        return messageThreadRepository.findById(threadId)
                .map(dtoMapper::toMessageThreadDTO)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
    }

    public List<MessageThreadDTO> getAllThreads() {
        return messageThreadRepository.findAll()
                .stream()
                .map(dtoMapper::toMessageThreadDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageThreadDTO updateThread(UUID threadId, MessageThreadDTO threadDTO) {
        MessageThread thread = messageThreadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        thread.setCreated_at(threadDTO.getCreated_at() != null ? threadDTO.getCreated_at() : thread.getCreated_at());
        MessageThread updated = messageThreadRepository.save(thread);
        return dtoMapper.toMessageThreadDTO(updated);
    }

    @Transactional
    public void deleteThread(UUID threadId) {
        if (!messageThreadRepository.existsById(threadId)) {
            throw new IllegalArgumentException("Thread not found");
        }
        messageThreadRepository.deleteById(threadId);
    }
}


