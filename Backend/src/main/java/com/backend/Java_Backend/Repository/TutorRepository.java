package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor,Integer> {
    @Query("SELECT t FROM Tutor t WHERE t.student_id = :studentId")
    Optional<Tutor> findByStudent_id(@Param("studentId") int studentId);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tutor t WHERE t.student_id = :studentId")
    boolean existsByStudent_id(@Param("studentId") int studentId);
}
