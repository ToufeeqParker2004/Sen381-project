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
//    // Find all participants by threadID
//    List<ThreadParticipant> findByThread_ThreadId(UUID threadId);

    // Optional: find a specific participant in a thread
    Optional<ThreadParticipant> findById_ThreadIdAndId_StudentId(UUID threadId, Integer studentId);
}
