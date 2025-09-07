package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class User {
    private String name;
    private String email;
    private String phone;
    private String bio;
    private String password;
    private Timestamp createdAt;

    public User(String name, String email, String phone, String bio, String password, Timestamp createdAt) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.bio = bio;
        this.password = password;
        this.createdAt = createdAt;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Timestamp  getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp  createdAt) {
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
