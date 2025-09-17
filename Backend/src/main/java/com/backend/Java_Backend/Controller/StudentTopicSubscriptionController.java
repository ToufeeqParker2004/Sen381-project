package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.StudentTopicSubscriptionDTO;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.StudentTopicSubscriptionId;
import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.StudentTopicSubscriptionRepository;
import com.backend.Java_Backend.Repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student-Topic")
public class StudentTopicSubscriptionController {
    @Autowired
    private StudentTopicSubscriptionRepository repository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TopicRepository topicRepository;
    @PostMapping
    public StudentTopicSubscriptionDTO create(StudentTopicSubscriptionDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Topic topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        StudentTopicSubscription subscription = new StudentTopicSubscription(student, topic);
        repository.save(subscription);
        return new StudentTopicSubscriptionDTO(subscription.getStudent().getId(), subscription.getTopic().getId(), subscription.getSubscribedAt());
    }
    @GetMapping
    public List<StudentTopicSubscriptionDTO> findAll() {
        return repository.findAll().stream()
                .map(sub -> new StudentTopicSubscriptionDTO(sub.getStudent().getId(), sub.getTopic().getId(), sub.getSubscribedAt()))
                .collect(Collectors.toList());
    }
    @GetMapping("/{id}")
    public StudentTopicSubscriptionDTO findById(int studentId, int topicId) {
        StudentTopicSubscription subscription = repository.findById(new StudentTopicSubscriptionId(studentId, topicId))
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        return new StudentTopicSubscriptionDTO(subscription.getStudent().getId(), subscription.getTopic().getId(), subscription.getSubscribedAt());
    }
    @GetMapping("/{studentId}")
    public List<StudentTopicSubscriptionDTO> findByStudentId(int studentId) {
        return repository.findByStudentId(studentId).stream()
                .map(sub -> new StudentTopicSubscriptionDTO(sub.getStudent().getId(), sub.getTopic().getId(), sub.getSubscribedAt()))
                .collect(Collectors.toList());
    }
    @GetMapping("/{topicId}")
    public List<StudentTopicSubscriptionDTO> findByTopicId(int topicId) {
        return repository.findByTopicId(topicId).stream()
                .map(sub -> new StudentTopicSubscriptionDTO(sub.getStudent().getId(), sub.getTopic().getId(), sub.getSubscribedAt()))
                .collect(Collectors.toList());
    }
    @PutMapping
    public StudentTopicSubscriptionDTO update(int studentId, int topicId, StudentTopicSubscriptionDTO dto) {
        StudentTopicSubscription subscription = repository.findById(new StudentTopicSubscriptionId(studentId, topicId))
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        if (dto.getSubscribedAt() != null) {
            subscription.setSubscribedAt(dto.getSubscribedAt());
        }
        repository.save(subscription);
        return new StudentTopicSubscriptionDTO(subscription.getStudent().getId(), subscription.getTopic().getId(), subscription.getSubscribedAt());
    }
    @DeleteMapping
    public void delete(int studentId, int topicId) {
        repository.deleteById(new StudentTopicSubscriptionId(studentId, topicId));
    }
}
