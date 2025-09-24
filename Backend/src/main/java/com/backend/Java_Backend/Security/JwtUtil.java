package com.backend.Java_Backend.Security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final String SECRET = "Wwyt0QbrvrHhJfmdNruwkeWfe7gpnzdCoLZD1K5CopyVHQFwUsTfB2Qp45IftLrAWPG10D+APp5Wi0few2Qbjw==";
    private static final long EXPIRATION_TIME = 3600_000; // 1 hour

    // Generate token for students/tutors (int ID)
    public static String generateToken(int id, String email, List<String> roles) {
        return JWT.create()
                .withSubject(String.valueOf(id))
                .withClaim("email", email)
                .withArrayClaim("roles", roles.toArray(new String[0]))
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET));
    }

    // Generate token for admins (UUID ID)
    public static String generateToken(UUID id, String username, List<String> roles) {
        return JWT.create()
                .withSubject(id.toString())
                .withClaim("email", username) // Store username in email claim for admins
                .withArrayClaim("roles", roles.toArray(new String[0]))
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET));
    }

    // Keep the original for simple student token without roles
    public static String generateToken(int id, String email) {
        return generateToken(id, email, List.of("STUDENT"));
    }

    public static DecodedJWT verifyToken(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(SECRET))
                    .build()
                    .verify(token);
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    // Utility methods for extracting claims
    public static String getSubject(DecodedJWT jwt) {
        return jwt != null ? jwt.getSubject() : null;
    }

    public static String getEmail(DecodedJWT jwt) {
        return jwt != null ? jwt.getClaim("email").asString() : null;
    }

    public static List<String> getRoles(DecodedJWT jwt) {
        return jwt != null ? jwt.getClaim("roles").asList(String.class) : null;
    }
}
