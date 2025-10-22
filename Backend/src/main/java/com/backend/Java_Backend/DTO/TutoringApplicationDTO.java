package com.backend.Java_Backend.DTO;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public class TutoringApplicationDTO {
    private Integer studentId;
    private MultipartFile applicationTranscript;
    private List<String> modules; // Changed to List<String>
    private String experienceDescription;
    private String availabilityJson;
    private String status;

    // Getters and setters
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public MultipartFile getApplicationTranscript() { return applicationTranscript; }
    public void setApplicationTranscript(MultipartFile applicationTranscript) { this.applicationTranscript = applicationTranscript; }
    public List<String> getModules() { return modules; }
    public void setModules(List<String> modules) { this.modules = modules; }
    public String getExperienceDescription() { return experienceDescription; }
    public void setExperienceDescription(String experienceDescription) { this.experienceDescription = experienceDescription; }
    public String getAvailabilityJson() { return availabilityJson; }
    public void setAvailabilityJson(String availabilityJson) { this.availabilityJson = availabilityJson; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}