// StudentControllerLoginTest.java
package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.LoginRequest;
import com.backend.Java_Backend.Services.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentControllerLoginTest {

    @Mock
    private AuthService authService;

    @Mock
    private LoginRequest loginRequest; // Mock the LoginRequest instead of creating real instances

    @InjectMocks
    private StudentController studentController;

    @Test
    void login_WithValidCredentials_ShouldReturnToken() {
        // Arrange
        String expectedToken = "jwt-token-12345";
        when(loginRequest.getIdentifier()).thenReturn("john.doe@example.com");
        when(loginRequest.getPassword()).thenReturn("correctPassword");
        when(authService.login("john.doe@example.com", "correctPassword"))
                .thenReturn(expectedToken);

        // Act
        ResponseEntity<?> response = studentController.login(loginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals(expectedToken, responseBody.get("token"));

        verify(authService).login("john.doe@example.com", "correctPassword");
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnUnauthorized() {
        // Arrange
        when(loginRequest.getIdentifier()).thenReturn("john.doe@example.com");
        when(loginRequest.getPassword()).thenReturn("wrongPassword");
        when(authService.login("john.doe@example.com", "wrongPassword"))
                .thenReturn(null);

        // Act
        ResponseEntity<?> response = studentController.login(loginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());

        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Incorrect identifier or password", responseBody.get("error"));
    }

    @Test
    void login_WithEmptyCredentials_ShouldReturnUnauthorized() {
        // Arrange
        when(loginRequest.getIdentifier()).thenReturn("");
        when(loginRequest.getPassword()).thenReturn("password");
        when(authService.login("", "password")).thenReturn(null);

        // Act
        ResponseEntity<?> response = studentController.login(loginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }


}