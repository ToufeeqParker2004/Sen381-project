package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class TutorDetailsDTO {
    private Integer id; // Tutor ID
    private Integer studentId; // Student ID linked to the tutor
    private Timestamp createdAt; // Tutor creation timestamp
    private String name; // Student name
    private String email; // Student email
    private String phoneNumber; // Student phone number
    private String bio; // Student bio
    private String location; // Student location
    private List<Integer> moduleIds; // IDs of modules assigned to the tutor

    // Constructor with all fields
    public TutorDetailsDTO(Integer id, Integer studentId, Timestamp createdAt, String name, String email,
                           String phoneNumber, String bio, String location, List<Integer> moduleIds) {
        this.id = id;
        this.studentId = studentId;
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.location = location;
        this.moduleIds = moduleIds;
    }

    // Default constructor
    public TutorDetailsDTO() {
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<Integer> getModuleIds() {
        return moduleIds;
    }

    public void setModuleIds(List<Integer> moduleIds) {
        this.moduleIds = moduleIds;
    }
}
