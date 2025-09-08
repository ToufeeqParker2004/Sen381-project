package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class StudentTutorSubscription {
    int student_id;
    int tutor_id;
    Timestamp subscripbed_at;

    public StudentTutorSubscription(int student_id, int tutor_id, Timestamp subscripbed_at) {
        this.student_id = student_id;
        this.tutor_id = tutor_id;
        this.subscripbed_at = subscripbed_at;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }

    public int getTutor_id() {
        return tutor_id;
    }

    public void setTutor_id(int tutor_id) {
        this.tutor_id = tutor_id;
    }

    public Timestamp getSubscripbed_at() {
        return subscripbed_at;
    }

    public void setSubscripbed_at(Timestamp subscripbed_at) {
        this.subscripbed_at = subscripbed_at;
    }
}
