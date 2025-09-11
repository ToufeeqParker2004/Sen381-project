package com.backend.Java_Backend.NLP_Moderation;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ModerationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String moderationUrl = "http://localhost:5001/moderate";

    public boolean isPostAllowed(String text) {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    moderationUrl,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> result = response.getBody();
            return result != null && (boolean) result.get("allowed");

        } catch (Exception e) {
            System.err.println("Error calling moderation API: " + e.getMessage());
            // You can decide: block by default OR allow if service fails
            return false;
        }
    }
}

