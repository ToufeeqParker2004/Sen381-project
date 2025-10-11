package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.DTO.StudentDTO;
import com.backend.Java_Backend.Models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.studentModules sm LEFT JOIN FETCH sm.module WHERE s.id = :studentId")
    Student findByIdWithModules(@Param("studentId") Integer studentId);
    Optional<Student> findByEmail(String email);
    List<Student> findAll();
    @Query("SELECT s FROM Student s WHERE s.id = (" +
            "SELECT t.student_id FROM Tutor t WHERE t.id = :tutorId)")
    Student findStudentByTutorId(@Param("tutorId") Integer tutorId);

}
