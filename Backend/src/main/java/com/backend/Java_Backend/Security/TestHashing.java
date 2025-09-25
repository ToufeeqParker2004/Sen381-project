package com.backend.Java_Backend.Security;

public class TestHashing {
    public static void main(String[] args) {
        String password = "1111";

        String hashed = PasswordHasher.hashPassword(password);
        System.out.println("Hashed: " + hashed);

        boolean isMatch = PasswordHasher.verifyPassword("test@1", hashed);
        System.out.println("Password match: " + isMatch); // true
    }
}



