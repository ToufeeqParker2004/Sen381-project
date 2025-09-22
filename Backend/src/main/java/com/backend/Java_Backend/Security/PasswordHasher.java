package com.backend.Java_Backend.Security;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class PasswordHasher {

    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;

    // Fixed salt (just to satisfy PBKDF2)
    private static final byte[] FIXED_SALT = "MyFixedSalt1234".getBytes();

    // Hash password using PBKDF2 with a fixed salt
    public static String hashPassword(String password) {
        char[] chars = password.toCharArray();
        PBEKeySpec spec = new PBEKeySpec(chars, FIXED_SALT, ITERATIONS, KEY_LENGTH);

        try {
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Error while hashing password: " + e.getMessage(), e);
        }
    }

    // Verify password
    public static boolean verifyPassword(String password, String expectedHash) {
        return hashPassword(password).equals(expectedHash);
    }
}
