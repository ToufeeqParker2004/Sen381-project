package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TopicService {
    private final TopicRepository topicRepository;

    @Autowired
    public TopicService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    // Get all students
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    // Get a student by ID
    public Optional<Topic> getTopicById(int id) {
        return topicRepository.findById(id);
    }

    // Save or update a student
    public Topic saveTopic(Topic topic) {
        return topicRepository.save(topic);
    }

    // Delete a student by ID
    public void deleteTopic(int id) {
        topicRepository.deleteById(id);
    }


}
