package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LearningMatRepository extends JpaRepository<LearningMaterial, UUID> {
    Optional<LearningMaterial> findbyTitle(String title);
}
