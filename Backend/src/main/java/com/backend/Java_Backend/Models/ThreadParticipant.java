package com.backend.Java_Backend.Models;

import java.util.UUID;

public class ThreadParticipant {
    UUID thread_id;
    int student_id;

    public ThreadParticipant(UUID thread_id, int student_id) {
        this.thread_id = thread_id;
        this.student_id = student_id;
    }

    public UUID getThread_id() {
        return thread_id;
    }

    public void setThread_id(UUID thread_id) {
        this.thread_id = thread_id;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }
}
