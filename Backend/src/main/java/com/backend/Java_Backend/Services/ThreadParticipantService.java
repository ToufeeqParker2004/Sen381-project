package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Models.ThreadParticipantId;
import com.backend.Java_Backend.Repository.ThreadParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ThreadParticipantService {

    private final ThreadParticipantRepository participantRepo;

    public ThreadParticipantService(ThreadParticipantRepository participantRepo) {
        this.participantRepo = participantRepo;
    }

    public ThreadParticipant addParticipant(UUID threadID, Long userId) {
        ThreadParticipantId id = new ThreadParticipantId(threadID, userId);
        ThreadParticipant participant = new ThreadParticipant(id);
        return participantRepo.save(participant);
    }
}
