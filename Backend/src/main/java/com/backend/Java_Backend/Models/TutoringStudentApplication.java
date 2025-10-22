package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "tutoring_student_applications")
public class TutoringStudentApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(name = "application_transcript", nullable = false)
    private String applicationTranscript;

    @Column(name = "modules")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> modules;

    @Column(name = "experience_description")
    private String experienceDescription;

    @Column(name = "availability_json")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, List<Map<String, String>>> availabilityJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Tutor getTutor() { return tutor; }
    public void setTutor(Tutor tutor) { this.tutor = tutor; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getApplicationTranscript() { return applicationTranscript; }
    public void setApplicationTranscript(String applicationTranscript) { this.applicationTranscript = applicationTranscript; }
    public List<String> getModules() { return modules; }
    public void setModules(List<String> modules) { this.modules = modules; }
    public String getExperienceDescription() { return experienceDescription; }
    public void setExperienceDescription(String experienceDescription) { this.experienceDescription = experienceDescription; }
    public Map<String, List<Map<String, String>>> getAvailabilityJson() { return availabilityJson; }
    public void setAvailabilityJson(Map<String, List<Map<String, String>>> availabilityJson) { this.availabilityJson = availabilityJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
