package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Timestamp;

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

    // Default constructor is required by JPA
    public Student() {}

    public Student(int id, Timestamp createdAt, String name, String email, String phoneNumber, String bio, String password) {
        this.id = id;
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

    public void setId(int id) {
        this.id = id;
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
}
