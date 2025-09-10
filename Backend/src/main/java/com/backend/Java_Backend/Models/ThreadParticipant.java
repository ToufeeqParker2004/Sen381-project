package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "thread_participants")
public class ThreadParticipant {

    @EmbeddedId
    private ThreadParticipantId id;

    @MapsId("threadId")  // tells Hibernate to use id.threadId for this relation
    @ManyToOne
    @JoinColumn(name = "thread_id")
    private MessageThread thread;

    @MapsId("studentId")
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    public ThreadParticipant() { }

    public ThreadParticipant(ThreadParticipantId id) {
        this.id = id;

    }

    // Getters and setters
    public ThreadParticipantId getId() { return id; }
    public void setId(ThreadParticipantId id) { this.id = id; }


}


