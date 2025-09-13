package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class StudentWithModuleDTO {
    private int id;

    private Timestamp createdAt;

    private String name;

    private String email;


    private String phoneNumber;

    private String bio;
    private List<ModuleDTO> modules;

    public StudentWithModuleDTO() {
    }

    public StudentWithModuleDTO(int id, Timestamp createdAt, String name, String email, String phoneNumber, String bio, List<ModuleDTO> modules) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.modules = modules;
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

    public List<ModuleDTO> getModules() {
        return modules;
    }

    public void setModules(List<ModuleDTO> modules) {
        this.modules = modules;
    }
}
