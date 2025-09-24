package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;

public class StudentModuleDTO {
    private Integer studentId;
    private Integer moduleId;
    private Timestamp enrolled_at; // Fix typo from entrolled_at

    public StudentModuleDTO() {}

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public Integer getModuleId() { return moduleId; }
    public void setModuleId(Integer moduleId) { this.moduleId = moduleId; }
    public Timestamp getEnrolled_at() { return enrolled_at; }
    public void setEnrolled_at(Timestamp enrolled_at) { this.enrolled_at = enrolled_at; }
}
