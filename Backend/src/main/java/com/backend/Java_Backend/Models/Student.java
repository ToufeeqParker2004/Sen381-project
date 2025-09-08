package com.backend.Java_Backend.Models;

import java.sql.Timestamp;

public class Student {
    int id;
    private Timestamp createdAt;
    private String name;
    private String email;
    private String phone_number;
    private String bio;
    private String password;

    public Student(int id, Timestamp createdAt, String name, String email, String phone_number, String bio, String password) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.email = email;
        this.phone_number = phone_number;
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
        return phone_number;
    }

    public void setPhone_number(String phone_number) {
        this.phone_number = phone_number;
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
