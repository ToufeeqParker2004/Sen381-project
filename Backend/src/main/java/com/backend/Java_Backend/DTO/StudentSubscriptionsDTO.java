package com.backend.Java_Backend.DTO;

import java.util.List;

public class StudentSubscriptionsDTO {
    private int studentId;
    private List<StudentTopicSubscriptionDTO> topicSubscriptions;
    private List<StudentTutorSubscriptionDTO> tutorSubscriptions;

    public StudentSubscriptionsDTO() {}

    public StudentSubscriptionsDTO(int studentId, List<StudentTopicSubscriptionDTO> topicSubscriptions, List<StudentTutorSubscriptionDTO> tutorSubscriptions) {
        this.studentId = studentId;
        this.topicSubscriptions = topicSubscriptions;
        this.tutorSubscriptions = tutorSubscriptions;
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public List<StudentTopicSubscriptionDTO> getTopicSubscriptions() { return topicSubscriptions; }
    public void setTopicSubscriptions(List<StudentTopicSubscriptionDTO> topicSubscriptions) { this.topicSubscriptions = topicSubscriptions; }

    public List<StudentTutorSubscriptionDTO> getTutorSubscriptions() { return tutorSubscriptions; }
    public void setTutorSubscriptions(List<StudentTutorSubscriptionDTO> tutorSubscriptions) { this.tutorSubscriptions = tutorSubscriptions; }
}
