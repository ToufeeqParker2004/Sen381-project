package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "start_datetime")
    private Timestamp startDatetime;

    @Column(name = "end_datetime")
    private Timestamp endDatetime;

    @Column(name = "status")
    private String status; // e.g., pending, accepted, cancelled

    // Getters and Setters
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public Tutor getTutor() {
        return tutor;
    }
    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }
    public Student getStudent() {
        return student;
    }
    public void setStudent(Student student) {
        this.student = student;
    }
    public Timestamp getStartDatetime() {
        return startDatetime;
    }
    public void setStartDatetime(Timestamp startDatetime) {
        this.startDatetime = startDatetime;
    }
    public Timestamp getEndDatetime() {
        return endDatetime;
    }
    public void setEndDatetime(Timestamp endDatetime) {
        this.endDatetime = endDatetime;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
