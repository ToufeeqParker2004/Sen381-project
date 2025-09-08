package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class Tutor {
    int id;
    Timestamp created_at;
    int student_id;

    public Tutor(int id, Timestamp created_at, int student_id) {
        this.id = id;
        this.created_at = created_at;
        this.student_id = student_id;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }
}
