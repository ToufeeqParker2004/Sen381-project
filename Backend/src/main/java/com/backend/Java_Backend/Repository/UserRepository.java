package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.User;
import org.springframework.stereotype.Repository;

import java.sql.*;

@Repository
public class UserRepository {

    private final String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
    private final String dbUser = "postgres.csxddebihagweizlaaiq";
    private final String dbPassword = "ETHBqYCnwJZq7S67"; // replace

    public User login(String name, String surname) {
        User user = null;
        String sql = "SELECT name, surname FROM testuser WHERE name = ? AND surname = ?";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, surname);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                user = new User(rs.getString("name"), rs.getString("surname"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return user;
    }

    public boolean signUp(String name, String surname) {
        String sql = "INSERT INTO testuser (name,surname) VALUES(?,?)";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, name);
            stmt.setString(2, surname);

            int rowsAffected = stmt.executeUpdate();

            return rowsAffected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

}