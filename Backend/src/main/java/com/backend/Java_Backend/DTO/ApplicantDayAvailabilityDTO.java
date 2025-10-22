package com.backend.Java_Backend.DTO;

import java.util.UUID;

public class ApplicantDayAvailabilityDTO {
    private UUID applicationId;
    private Integer studentId;
    private String studentName;
    private Long uniqueDays;

    public ApplicantDayAvailabilityDTO(UUID applicationId, Integer studentId, String studentName, Long uniqueDays) {
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.uniqueDays = uniqueDays;
    }

    // Getters and setters
    public UUID getApplicationId() { return applicationId; }
    public void setApplicationId(UUID applicationId) { this.applicationId = applicationId; }
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getUniqueDays() { return uniqueDays; }
    public void setUniqueDays(Long uniqueDays) { this.uniqueDays = uniqueDays; }
}
