package com.backend.Java_Backend.DTO;

import java.util.List;

public class TutorSearchResponse {
    private int tutorId;
    private List<ResourceMatchForTutorDTO> matches;

    // Getters and Setters
    public int getTutorId() {
        return tutorId;
    }

    public void setTutorId(int tutorId) {
        this.tutorId = tutorId;
    }

    public List<ResourceMatchForTutorDTO> getMatches() {
        return matches;
    }

    public void setMatches(List<ResourceMatchForTutorDTO> matches) {
        this.matches = matches;
    }
}
