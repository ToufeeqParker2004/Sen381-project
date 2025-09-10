package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Services.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/topics")
public class TopicController {
    private final TopicService topicService;

    @Autowired
    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    // Get all topics
    @GetMapping
    public List<Topic> getAllTopics() {
        return topicService.getAllTopics();
    }

    // Get topic by ID
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable int id) {
        Optional<Topic> topic = topicService.getTopicById(id);
        return topic.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new topic
    @PostMapping
    public Topic createTopic(@RequestBody Topic topic) {
        return topicService.saveTopic(topic);
    }

    // Update topic
    @PutMapping("/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable int id, @RequestBody Topic updatedTopic) {
        return topicService.getTopicById(id).map(topic -> {
            topic.setModule_id(updatedTopic.getModule_id());
            topic.setCreator_id(updatedTopic.getCreator_id());
            topic.setCreated_at(updatedTopic.getCreated_at());
            topic.setUpdated_at(updatedTopic.getUpdated_at());
            topic.setTitle(updatedTopic.getTitle());
            topic.setDescription(updatedTopic.getDescription());
            topic.setStatus(updatedTopic.getStatus());
            return ResponseEntity.ok(topicService.saveTopic(topic));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete topic
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable int id) {
        if (topicService.getTopicById(id).isPresent()) {
            topicService.deleteTopic(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
