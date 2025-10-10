package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByTutorId(Integer tutorId);

    @Query("SELECT b FROM Booking b WHERE b.tutor.id = :tutorId AND b.startDatetime >= :start AND b.endDatetime <= :end")
    List<Booking> findByTutorIdAndDateRange(@Param("tutorId") Integer tutorId, @Param("start") Timestamp start, @Param("end") Timestamp end);
}
