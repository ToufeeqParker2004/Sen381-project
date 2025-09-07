package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.User;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;

@Repository
public class UserRepository {

    private final String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
    private final String dbUser = "postgres.csxddebihagweizlaaiq";
    private final String dbPassword = "ETHBqYCnwJZq7S67"; // replace


    public User login(String email, String password) {
        User user = null;
        String sql = "SELECT * FROM student WHERE email = ? AND password = ?";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setString(2, password);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Timestamp ts = rs.getTimestamp("created_at");
                user = new User(rs.getString("name"), rs.getString("email"),rs.getString("phone"),rs.getString("bio"),null,ts);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return user;
    }

    public boolean signUp(String name, String email, String phone, String bio, String password) {
        String sql = "INSERT INTO student (created_at, name, email, phone, bio, password) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setString(2, name);
            stmt.setString(3, email);
            stmt.setString(4, phone);
            stmt.setString(5, bio);
            stmt.setString(6, password);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }


}