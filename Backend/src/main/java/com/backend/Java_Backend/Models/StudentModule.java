package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class StudentModule {
    int student_id;
    int module_id;
    Timestamp enrolled_at;

    public StudentModule(int student_id, int module_id, Timestamp enrolled_at) {
        this.student_id = student_id;
        this.module_id = module_id;
        this.enrolled_at = enrolled_at;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }

    public int getModule_id() {
        return module_id;
    }

    public void setModule_id(int module_id) {
        this.module_id = module_id;
    }

    public Timestamp getEnrolled_at() {
        return enrolled_at;
    }

    public void setEnrolled_at(Timestamp enrolled_at) {
        this.enrolled_at = enrolled_at;
    }
}
