package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentEvent;
import com.backend.Java_Backend.Models.StudentEventId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentEventRepository extends JpaRepository<StudentEvent, StudentEventId> {

    List<StudentEvent> findByStudentId(Long studentId);

    List<StudentEvent> findByEventId(UUID eventId);

    boolean existsByStudentIdAndEventId(Long studentId, UUID eventId);

    @Modifying
    @Query("DELETE FROM StudentEvent se WHERE se.student.id = :studentId AND se.event.id = :eventId")
    void deleteByStudentIdAndEventId(@Param("studentId") Long studentId, @Param("eventId") UUID eventId);

    @Query("SELECT COUNT(se) FROM StudentEvent se WHERE se.event.id = :eventId")
    int countByEventId(@Param("eventId") UUID eventId);
}
