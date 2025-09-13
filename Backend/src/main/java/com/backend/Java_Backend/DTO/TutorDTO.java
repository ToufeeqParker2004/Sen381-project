package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class TutorDTO {
    private int id;
    private Timestamp createdAt;
    private int studentId;
    private List<Integer> moduleIds;

    public TutorDTO() {}

    public TutorDTO(int id, Timestamp createdAt, int studentId, List<Integer> moduleIds) {
        this.id = id;
        this.createdAt = createdAt;
        this.studentId = studentId;
        this.moduleIds = moduleIds;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public List<Integer> getModuleIds() { return moduleIds; }
    public void setModuleIds(List<Integer> moduleIds) { this.moduleIds = moduleIds; }
}
