package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TutorRepository extends JpaRepository<Tutor,Integer> {
}
