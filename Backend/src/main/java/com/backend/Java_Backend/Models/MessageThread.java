package com.backend.Java_Backend.Models;


import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "message_threads")
public class MessageThread {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID threadId;

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

