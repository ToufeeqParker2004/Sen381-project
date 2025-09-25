// LoginRequest.java (in DTO package)
package com.backend.Java_Backend.DTO;

public class LoginRequest {
    private String identifier; // Email for students/tutors, username for admins
    private String password;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
