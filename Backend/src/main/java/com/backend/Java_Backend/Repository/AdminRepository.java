package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
Optional<Admin> findByUsername(String Username);
}
