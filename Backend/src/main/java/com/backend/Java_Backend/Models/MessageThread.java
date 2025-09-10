package com.backend.Java_Backend.Models;


import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
public class MessageThread {

    @Id
    @Column(name = "threadid")
    private UUID threadID;

    private String title;

    @OneToMany
    @JoinColumn(name = "thread_id", referencedColumnName = "threadid") // Fixed
    private List<ThreadParticipant> participants;

    @OneToMany
    @JoinColumn(name = "threadid", referencedColumnName = "threadid") // Fixed
    private List<Message> messages;

    // Getters and setters
    public UUID getThreadID() {
        return threadID;
    }

    public void setThreadID(UUID threadID) {
        this.threadID = threadID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

