package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.TopicDTO;
import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicService {
    @Autowired
    private TopicRepository repository;

    public TopicDTO create(TopicDTO dto) {
        Topic topic = new Topic(dto.getModuleId(), dto.getCreatorId(), new Timestamp(System.currentTimeMillis()),
                new Timestamp(System.currentTimeMillis()), dto.getTitle(), dto.getDescription(), dto.getStatus());
        topic = repository.save(topic);
        return new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus());
    }

    public List<TopicDTO> findAll() {
        return repository.findAll().stream()
                .map(topic -> new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                        topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus()))
                .collect(Collectors.toList());
    }

    public TopicDTO findById(int id) {
        Topic topic = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        return new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus());
    }

    public List<TopicDTO> findByModule_id(int module_id) {
        return repository.findByModule_id(module_id).stream()
                .map(topic -> new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                        topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus()))
                .collect(Collectors.toList());
    }

    public List<TopicDTO> findByCreatorId(int creatorId) {
        return repository.findByCreator_id(creatorId).stream()
                .map(topic -> new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                        topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus()))
                .collect(Collectors.toList());
    }

    public TopicDTO update(int id, TopicDTO dto) {
        Topic topic = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        if (dto.getModuleId() != 0) {
            topic.setModule_id(dto.getModuleId());
        }
        if (dto.getCreatorId() != 0) {
            topic.setCreator_id(dto.getCreatorId());
        }
        if (dto.getCreatedAt() != null) {
            topic.setCreated_at(dto.getCreatedAt());
        }
        if (dto.getUpdatedAt() != null) {
            topic.setUpdated_at(dto.getUpdatedAt());
        }
        if (dto.getTitle() != null) {
            topic.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            topic.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            topic.setStatus(dto.getStatus());
        }
        topic = repository.save(topic);
        return new TopicDTO(topic.getId(), topic.getModule_id(), topic.getCreator_id(), topic.getCreated_at(),
                topic.getUpdated_at(), topic.getTitle(), topic.getDescription(), topic.getStatus());
    }

    public void delete(int id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Topic not found with ID: " + id);
        }
        repository.deleteById(id);
    }

}
