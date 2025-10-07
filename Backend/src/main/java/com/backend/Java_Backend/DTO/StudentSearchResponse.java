package com.backend.Java_Backend.DTO;

import java.util.List;

public class StudentSearchResponse {
    private int studentId;
    private List<ResourceMatchForStudentDTO> matches;

    // Getters and Setters
    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public List<ResourceMatchForStudentDTO> getMatches() {
        return matches;
    }

    public void setMatches(List<ResourceMatchForStudentDTO> matches) {
        this.matches = matches;
    }
}
