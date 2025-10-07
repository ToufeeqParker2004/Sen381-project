package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Resources;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourcesRepository extends JpaRepository<Resources, Integer> {
    List<Resources> findByStudentId(int studentId);
    List<Resources> findByTutorID(int tutorId);
    List<Resources> findByLearningMaterialsID(UUID learningMaterialsId);
}
