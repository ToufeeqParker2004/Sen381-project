package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "thread_participants")
public class ThreadParticipant {

    @EmbeddedId
    private ThreadParticipantId id;

    public ThreadParticipant() { }

    public ThreadParticipant(ThreadParticipantId id) {
        this.id = id;

    }

    // Getters and setters
    public ThreadParticipantId getId() { return id; }
    public void setId(ThreadParticipantId id) { this.id = id; }


}


