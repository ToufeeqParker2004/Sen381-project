package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_topic_subscriptions")
public class StudentTopicSubscription {

    @EmbeddedId
    private StudentTopicSubscriptionId id;

    @ManyToOne
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @MapsId("topicId")
    @JoinColumn(name = "topic_id")
    private Topic topic;

    private LocalDateTime subscribedAt;

    public StudentTopicSubscription() { }

    public StudentTopicSubscription(Student student, Topic topic) {
        this.student = student;
        this.topic = topic;
        this.id = new StudentTopicSubscriptionId(student.getId(), topic.getId());
        this.subscribedAt = LocalDateTime.now();
    }

    // Getters and setters
    public StudentTopicSubscriptionId getId() { return id; }
    public void setId(StudentTopicSubscriptionId id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }

    public LocalDateTime getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; }
}

