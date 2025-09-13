package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Models.ThreadParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface ThreadParticipantRepository extends JpaRepository<ThreadParticipant, ThreadParticipantId> {
    List<ThreadParticipant> findByIdThreadId(UUID threadId);
    List<ThreadParticipant> findByIdStudentId(Integer studentId);
}
