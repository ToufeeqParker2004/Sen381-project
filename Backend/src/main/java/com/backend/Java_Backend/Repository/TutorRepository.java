package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorRepository extends JpaRepository<Tutor,Integer> {
    @Query("SELECT t FROM Tutor t WHERE t.student_id = :student_id")
    List<Tutor> findByStudent_id(@Param("student_id") int student_id);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
            "FROM Tutor t WHERE t.student_id = :studentId")
    boolean existsByStudentId(@Param("studentId") int studentId);

}
