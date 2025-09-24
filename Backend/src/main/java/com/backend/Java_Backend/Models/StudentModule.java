package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Time;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_modules")
public class StudentModule {

    @EmbeddedId
    private StudentModuleId id;

    @ManyToOne
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @MapsId("moduleId")
    @JoinColumn(name = "module_id")
    private Modules module;

    private Timestamp enrolledAt;

    public StudentModule() { }

    public StudentModule(Student student, Modules module) {
        this.student = student;
        this.module = module;
        this.id = new StudentModuleId(student.getId(), module.getId());
        this.enrolledAt = Timestamp.from(Instant.now());
    }

    // Getters and setters
    public StudentModuleId getId() { return id; }
    public void setId(StudentModuleId id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Modules getModule() { return module; }
    public void setModule(Modules module) { this.module = module; }

    public Timestamp getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(Timestamp enrolledAt) {
        this.enrolledAt = enrolledAt;
    }
}
