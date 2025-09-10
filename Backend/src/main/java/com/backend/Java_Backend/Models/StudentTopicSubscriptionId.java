package com.backend.Java_Backend.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentTopicSubscriptionId implements Serializable {
    @Column(name = "student_id")
    private int studentId;
    @Column(name = "topic_id")
    private int topicId;

    public StudentTopicSubscriptionId() { }

    public StudentTopicSubscriptionId(int studentId, int topicId) {
        this.studentId = studentId;
        this.topicId = topicId;
    }

    // Getters and setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getTopicId() { return topicId; }
    public void setTopicId(int topicId) { this.topicId = topicId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentTopicSubscriptionId)) return false;
        StudentTopicSubscriptionId that = (StudentTopicSubscriptionId) o;
        return studentId == that.studentId && topicId == that.topicId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, topicId);
    }
}

