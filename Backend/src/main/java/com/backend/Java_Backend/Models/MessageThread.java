package com.backend.Java_Backend.Models;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "message_threads")
public class MessageThread {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID threadId;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Timestamp created_at;

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    @OneToMany(mappedBy = "thread")   // link to ThreadParticipant.thread
    private List<ThreadParticipant> participants;


    @OneToMany(mappedBy = "thread")
    private List<Message> messages;

    public MessageThread() {
    }

    // Getters and setters
    public UUID getThreadId() {
        return threadId;
    }

    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }



    public List<ThreadParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ThreadParticipant> participants) {
        this.participants = participants;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }
}

