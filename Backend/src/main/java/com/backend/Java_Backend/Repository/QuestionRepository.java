package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
}
