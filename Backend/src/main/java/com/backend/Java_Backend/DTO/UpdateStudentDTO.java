// DTOs (continued)
package com.backend.Java_Backend.DTO;

public class UpdateStudentDTO {
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    // Password not included for update; if needed, add separately

    // Constructors
    public UpdateStudentDTO() {}

    public UpdateStudentDTO(String name, String email, String phoneNumber, String bio) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
