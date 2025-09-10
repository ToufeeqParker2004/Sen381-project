package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Response;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResponseRepository extends JpaRepository<Response, UUID> {
}
