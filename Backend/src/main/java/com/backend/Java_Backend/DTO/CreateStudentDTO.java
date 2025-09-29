// DTOs (Additions for CRUD)
package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;

public class CreateStudentDTO {
    private Timestamp createdAt;
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String password;
    private String Location;

    // Constructors
    public CreateStudentDTO() {}

    public CreateStudentDTO(Timestamp createdAt, String name, String email, String phoneNumber, String bio, String password,String location) {
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.password = password;
        this.Location = location;
    }

    // Getters and Setters
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getLocation() {
        return Location;
    }

    public void setLocation(String location) {
        Location = location;
    }
}
