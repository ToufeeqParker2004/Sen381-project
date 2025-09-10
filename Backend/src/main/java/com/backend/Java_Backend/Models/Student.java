package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name="students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment for Postgres/MySQL
    private int id;

    @Column(name = "created_at")
    private Timestamp createdAt;

    private String name;

    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String bio;

    private String password;

    //  link to modules
    @OneToMany(mappedBy = "student")
    private List<StudentModule> studentModules;

    @OneToMany(mappedBy = "student")
    private List<ThreadParticipant> threadParticipants;
    // Default constructor is required by JPA
    public Student() {}

    public Student( Timestamp createdAt, String name, String email, String phoneNumber, String bio, String password) {

        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.password = password;
    }

    public int getId() {
        return id;
    }



    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhone_number() {
        return phoneNumber;
    }

    public void setPhone_number(String phone_number) {
        this.phoneNumber = phone_number;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    @OneToMany(mappedBy = "student")
    public List<StudentModule> getStudentModules() { return studentModules; }
    public void setStudentModules(List<StudentModule> studentModules) { this.studentModules = studentModules; }
}
