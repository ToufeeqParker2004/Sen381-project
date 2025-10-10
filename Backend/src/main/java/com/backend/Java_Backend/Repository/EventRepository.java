package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Events, UUID> {
    @Query("SELECT e FROM Events e WHERE e.tutor_id = :tutorId")
    List<Events> findByTutorId(@Param("tutorId") Long tutorId);
}
