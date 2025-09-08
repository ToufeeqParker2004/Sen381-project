package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class Question {
    UUID id;
    int topic_id;
    int author_id;
    String question_text;
    Timestamp created_at;

    public Question(UUID id, int topic_id, int author_id, String question_text, Timestamp created_at) {
        this.id = id;
        this.topic_id = topic_id;
        this.author_id = author_id;
        this.question_text = question_text;
        this.created_at = created_at;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getTopic_id() {
        return topic_id;
    }

    public void setTopic_id(int topic_id) {
        this.topic_id = topic_id;
    }

    public int getAuthor_id() {
        return author_id;
    }

    public void setAuthor_id(int author_id) {
        this.author_id = author_id;
    }

    public String getQuestion_text() {
        return question_text;
    }

    public void setQuestion_text(String question_text) {
        this.question_text = question_text;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
