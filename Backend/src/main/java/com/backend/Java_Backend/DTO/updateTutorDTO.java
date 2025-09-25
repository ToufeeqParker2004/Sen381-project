package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;

public class updateTutorDTO {
    private Timestamp created_at;

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}
