package com.backend.Java_Backend.DTO;

import java.time.LocalDateTime;

public class StudentTopicSubscriptionDTO {
    private int studentId;
    private int topicId;
    private LocalDateTime subscribedAt;

    public StudentTopicSubscriptionDTO() {}

    public StudentTopicSubscriptionDTO(int studentId, int topicId, LocalDateTime subscribedAt) {
        this.studentId = studentId;
        this.topicId = topicId;
        this.subscribedAt = subscribedAt;
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getTopicId() { return topicId; }
    public void setTopicId(int topicId) { this.topicId = topicId; }

    public LocalDateTime getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; }
}
