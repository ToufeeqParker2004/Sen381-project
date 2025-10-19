package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.PersonalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalEventRepository extends JpaRepository<PersonalEvent, Integer> {
    List<PersonalEvent> findByStudentIdOrderByDateAscStartTimeAsc(Integer studentId);
    List<PersonalEvent> findByStudentIdAndDateBetween(Integer studentId, LocalDate startDate, LocalDate endDate);
    void deleteByIdAndStudentId(Integer id, Integer studentId);
    Optional<PersonalEvent> findByIdAndStudentId(Integer id, Integer studentId);

    @Query("SELECT p FROM PersonalEvent p WHERE p.studentId = :studentId AND p.date >= :startDate ORDER BY p.date ASC, p.startTime ASC")
    List<PersonalEvent> findUpcomingByStudentId(@Param("studentId") Integer studentId, @Param("startDate") LocalDate startDate);
}