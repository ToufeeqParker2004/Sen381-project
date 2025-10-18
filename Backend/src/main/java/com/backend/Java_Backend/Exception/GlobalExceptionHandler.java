package com.backend.Java_Backend.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final String SUPABASE_URL = "https://moikeoljuxygsrnuhfws.supabase.co/rest/v1/errors";
    private static final String SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWtlb2xqdXh5Z3NybnVoZndzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA2OTM2MywiZXhwIjoyMDc1NjQ1MzYzfQ.zgs01Qf6Hf3dm7O4RIQ4uC_tNL2EXaA6UPQnHMPrzu4";

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        ex.printStackTrace();

        Map<String, Object> errorData = new HashMap<>();
        errorData.put("message", ex.getMessage());
        errorData.put("stack_trace", getStackTraceAsString(ex));
        errorData.put("endpoint", request.getDescription(false));
        errorData.put("user_id", getCurrentUserId());  // Extract from JWT
        errorData.put("created_at", Instant.now().toString());

        // Send to Supabase asynchronously
        new Thread(() -> sendErrorToSupabase(errorData)).start();

        return new ResponseEntity<>("An error occurred. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String getStackTraceAsString(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : ex.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }

    private String getCurrentUserId() {
        // Extract user ID from JWT (Spring Security example)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            // JWT contains user ID in principal or details
            // Adjust based on  JWT structure
            return authentication.getName();  // Or extract from JWT claims
        }
        return "anonymous";
    }

    private void sendErrorToSupabase(Map<String, Object> errorData) {
        try {
            String jsonBody = new com.google.gson.Gson().toJson(errorData);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(SUPABASE_URL))
                    .header("apikey", SUPABASE_API_KEY)
                    .header("Authorization", "Bearer " + SUPABASE_API_KEY)
                    .header("Content-Type", "application/json")
                    .header("Prefer", "return=minimal")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 201) {
                System.err.println("Failed to log error to Supabase: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Error sending to Supabase: " + e.getMessage());
        }
    }
}
