package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class StudentTopicSubscription {
    int student_id;
    int topic_id;
    Timestamp subscribed_at;

    public StudentTopicSubscription(int student_id, int topic_id, Timestamp subscribed_at) {
        this.student_id = student_id;
        this.topic_id = topic_id;
        this.subscribed_at = subscribed_at;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }

    public int getTopic_id() {
        return topic_id;
    }

    public void setTopic_id(int topic_id) {
        this.topic_id = topic_id;
    }

    public Timestamp getSubscribed_at() {
        return subscribed_at;
    }

    public void setSubscribed_at(Timestamp subscribed_at) {
        this.subscribed_at = subscribed_at;
    }
}
