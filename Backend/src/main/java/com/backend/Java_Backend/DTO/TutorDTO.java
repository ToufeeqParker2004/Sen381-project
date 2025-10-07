// TutorDTO.java (in DTO package)
package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class TutorDTO {
    private Integer id; // tutor.id
    private Integer studentId;
    private Timestamp created_at;
    private String studentEmail; // From linked Student
    private List<Integer> moduleIds; // IDs from tutorModules

    public TutorDTO(Integer id, Integer studentId, Timestamp created_at, String studentEmail, List<Integer> moduleIds) {
        this.id = id;
        this.studentId = studentId;
        this.created_at = created_at;
        this.studentEmail = studentEmail;
        this.moduleIds = moduleIds;
    }

    public TutorDTO() {

    }

    // Getters/setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public Timestamp getCreated_at() { return created_at; }
    public void setCreated_at(Timestamp created_at) { this.created_at = created_at; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public List<Integer> getModuleIds() { return moduleIds; }
    public void setModuleIds(List<Integer> moduleIds) { this.moduleIds = moduleIds; }
}
