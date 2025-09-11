package com.backend.Java_Backend.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_tutor_subscriptions")
public class StudentTutorSubscription {

    @EmbeddedId
    private StudentTutorSubscriptionId id;

    @ManyToOne
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @MapsId("tutorId")
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;
    @Column(name ="subscribed_at")
    private LocalDateTime createdAt;

    public StudentTutorSubscription() { }

    public StudentTutorSubscription(Student student, Tutor tutor) {
        this.student = student;
        this.tutor = tutor;
        this.id = new StudentTutorSubscriptionId(student.getId(), tutor.getId());
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public StudentTutorSubscriptionId getId() { return id; }
    public void setId(StudentTutorSubscriptionId id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Tutor getTutor() { return tutor; }
    public void setTutor(Tutor tutor) { this.tutor = tutor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

