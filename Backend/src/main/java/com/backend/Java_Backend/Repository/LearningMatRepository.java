package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface LearningMatRepository extends JpaRepository<LearningMaterial, UUID> {
    Optional<LearningMaterial> findByTitle(String title);
}
