package com.backend.Java_Backend.Services;




import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Repository.StudentTopicSubcriptionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentTopicSubscriptionService {

    private final StudentTopicSubcriptionRepository repository;

    public StudentTopicSubscriptionService(StudentTopicSubcriptionRepository repository) {
        this.repository = repository;
    }

    // Subscribe a student to a topic
    public StudentTopicSubscription subscribe(Student student, Topic topic) {
        StudentTopicSubscription sts = new StudentTopicSubscription(student, topic);
        return repository.save(sts);
    }

    // Get topics a student is subscribed to
    public List<Topic> getTopicsForStudent(int studentId) {
        List<StudentTopicSubscription> subscriptions = repository.findByStudentId(studentId);
        List<Topic> topics = new ArrayList<>();
        for (StudentTopicSubscription sts : subscriptions) {
            topics.add(sts.getTopic());
        }
        return topics;
    }

    // Get students subscribed to a topic
    public List<Student> getStudentsForTopic(int topicId) {
        List<StudentTopicSubscription> subscriptions = repository.findByTopicId(topicId);
        List<Student> students = new ArrayList<>();
        for (StudentTopicSubscription sts : subscriptions) {
            students.add(sts.getStudent());
        }
        return students;
    }
}

