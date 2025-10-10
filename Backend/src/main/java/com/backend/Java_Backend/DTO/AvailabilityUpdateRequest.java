package com.backend.Java_Backend.DTO;

import java.util.List;

public class AvailabilityUpdateRequest {
    private Integer tutorId;
    private Boolean replaceAll;
    private List<AvailabilityDTO> availabilities;

    // Getters and Setters
    public Integer getTutorId() { return tutorId; }
    public void setTutorId(Integer tutorId) { this.tutorId = tutorId; }
    public Boolean getReplaceAll() { return replaceAll; }
    public void setReplaceAll(Boolean replaceAll) { this.replaceAll = replaceAll; }
    public List<AvailabilityDTO> getAvailabilities() { return availabilities; }
    public void setAvailabilities(List<AvailabilityDTO> availabilities) { this.availabilities = availabilities; }
}
