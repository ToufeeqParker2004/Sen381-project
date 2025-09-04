package com.backend.Java_Backend.Models;

public class TestUser {
    private String name;
    private String password;

    public TestUser(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public String getPassword() {
        return password;
    }
}
