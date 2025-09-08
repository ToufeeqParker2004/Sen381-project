package com.backend.Java_Backend.Models;

import java.sql.Timestamp;
import java.util.UUID;

public class Response {
    UUID id;
    UUID question_id;
    int responder_id;
    String response_text;
    int upvotes;
    Timestamp created_at;
    String[] attatchments;

    public Response(UUID id, UUID question_id, int responder_id, String response_text, int upvotes, Timestamp created_at, String[] attatchments) {
        this.id = id;
        this.question_id = question_id;
        this.responder_id = responder_id;
        this.response_text = response_text;
        this.upvotes = upvotes;
        this.created_at = created_at;
        this.attatchments = attatchments;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuestion_id() {
        return question_id;
    }

    public void setQuestion_id(UUID question_id) {
        this.question_id = question_id;
    }

    public int getResponder_id() {
        return responder_id;
    }

    public void setResponder_id(int responder_id) {
        this.responder_id = responder_id;
    }

    public String getResponse_text() {
        return response_text;
    }

    public void setResponse_text(String response_text) {
        this.response_text = response_text;
    }

    public int getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(int upvotes) {
        this.upvotes = upvotes;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public String[] getAttatchments() {
        return attatchments;
    }

    public void setAttatchments(String[] attatchments) {
        this.attatchments = attatchments;
    }
}
