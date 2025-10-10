package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Integer> {

    List<Availability> findByTutorId(Integer tutorId);

    @Query("SELECT a FROM Availability a WHERE a.tutor.id = :tutorId AND a.dayOfWeek = :dayOfWeek AND a.startDate IS NULL AND a.endDate IS NULL")
    List<Availability> findIndefiniteByTutorIdAndDayOfWeek(Integer tutorId, Integer dayOfWeek);

    @Query("SELECT a FROM Availability a WHERE a.tutor.id = :tutorId AND a.dayOfWeek IS NULL AND a.startDate IS NULL AND a.endDate IS NULL")
    List<Availability> findIndefiniteEveryDayByTutorId(Integer tutorId);

    @Query("SELECT a FROM Availability a WHERE a.tutor.id = :tutorId AND (a.startDate IS NULL OR a.startDate <= :endDate) AND (a.endDate IS NULL OR a.endDate >= :startDate)")
    List<Availability> findByTutorIdAndDateRange(Integer tutorId, LocalDate startDate, LocalDate endDate);

    @Modifying
    @Query("DELETE FROM Availability a WHERE a.tutor.id = :tutorId AND a.startDate IS NULL AND a.endDate IS NULL")
    void deleteAllIndefiniteByTutorId(Integer tutorId);
}