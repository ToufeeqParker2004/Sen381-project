// AdminDTO.java (in DTO package)
package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.UUID;

public class AdminDTO {
    private UUID id;
    private String username;
    private Timestamp created_at;

    public AdminDTO(UUID id, String username, Timestamp created_at) {
        this.id = id;
        this.username = username;
        this.created_at = created_at;
    }
    // Getters/setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
