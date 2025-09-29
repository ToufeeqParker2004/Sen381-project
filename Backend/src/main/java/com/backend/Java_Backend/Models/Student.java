package com.backend.Java_Backend.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name="students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "created_at")
    private Timestamp createdAt;

    private String name;
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String bio;
    private String password;
    private String location;

    @OneToMany(mappedBy = "student")
    @JsonIgnore
    private List<StudentModule> studentModules;

    @OneToMany(mappedBy = "student")
    @JsonIgnore
    private List<ThreadParticipant> threadParticipants;

    public Student() {}

    public Student(Timestamp createdAt, String name, String email, String phoneNumber, String bio, String password) {
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.password = password;
    }

    // Getters and setters - REMOVE DUPLICATES
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // KEEP ONLY ONE PHONE NUMBER GETTER/SETTER PAIR
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<StudentModule> getStudentModules() { return studentModules; }
    public void setStudentModules(List<StudentModule> studentModules) { this.studentModules = studentModules; }

    public List<ThreadParticipant> getThreadParticipants() { return threadParticipants; }
    public void setThreadParticipants(List<ThreadParticipant> threadParticipants) { this.threadParticipants = threadParticipants; }
}