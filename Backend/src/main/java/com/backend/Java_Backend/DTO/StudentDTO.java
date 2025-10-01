package com.backend.Java_Backend.DTO;

import jakarta.persistence.Column;

import java.sql.Timestamp;

public class StudentDTO {
    private int id;

    private Timestamp createdAt;

    private String name;

    private String email;


    private String phoneNumber;

    private String bio;
    private String location;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location; // Fix the assignment
    }

    public StudentDTO(int id, Timestamp createdAt, String name, String email, String phoneNumber, String bio) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    public StudentDTO() {

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
