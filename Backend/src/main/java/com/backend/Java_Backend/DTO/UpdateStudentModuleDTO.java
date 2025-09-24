package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class UpdateStudentModuleDTO {
    private int studentId;
    private int moduleId;
    private Timestamp enrolled_at;

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }

    public Timestamp getEnrolled_at() {
        return enrolled_at;
    }

    public void setEnrolled_at(Timestamp enrolled_at) {
        this.enrolled_at = enrolled_at;
    }
}
