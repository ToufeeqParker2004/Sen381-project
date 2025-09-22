package com.backend.Java_Backend.Security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;
import java.util.List;

public class JwtUtil {

    private static final String SECRET = "Wwyt0QbrvrHhJfmdNruwkeWfe7gpnzdCoLZD1K5CopyVHQFwUsTfB2Qp45IftLrAWPG10D+APp5Wi0few2Qbjw==";
    private static final long EXPIRATION_TIME = 3600_000; // 1 hour

    // Overloaded method to handle roles
    public static String generateToken(int studentId, String email, List<String> roles) {
        return JWT.create()
                .withSubject(String.valueOf(studentId))
                .withClaim("email", email)
                .withArrayClaim("roles", roles.toArray(new String[0]))
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET));
    }

    // Keep the original if you still need a simple token without roles
    public static String generateToken(int studentId, String email) {
        return generateToken(studentId, email, List.of("STUDENT"));
    }

    public static DecodedJWT verifyToken(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET))
                .build()
                .verify(token);
    }
}
