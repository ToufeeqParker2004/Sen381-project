package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.ThreadParticipantDTO;
import com.backend.Java_Backend.DTO.DTOMapper;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Models.ThreadParticipantId;
import com.backend.Java_Backend.Repository.ThreadParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ThreadParticipantService {
    private final ThreadParticipantRepository threadParticipantRepository;
    private final DTOMapper dtoMapper;

    public ThreadParticipantService(ThreadParticipantRepository threadParticipantRepository, DTOMapper dtoMapper) {
        this.threadParticipantRepository = threadParticipantRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional
    public ThreadParticipantDTO addParticipant(ThreadParticipantDTO participantDTO) {
        ThreadParticipant participant = dtoMapper.toThreadParticipantEntity(participantDTO);
        ThreadParticipant saved = threadParticipantRepository.save(participant);
        return dtoMapper.toThreadParticipantDTO(saved);
    }

    public List<ThreadParticipantDTO> getParticipantsByThreadId(UUID threadId) {
        return threadParticipantRepository.findByIdThreadId(threadId)
                .stream()
                .map(dtoMapper::toThreadParticipantDTO)
                .collect(Collectors.toList());
    }

    public List<ThreadParticipantDTO> getParticipantsByStudentId(Integer studentId) {
        return threadParticipantRepository.findByIdStudentId(studentId)
                .stream()
                .map(dtoMapper::toThreadParticipantDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ThreadParticipantDTO updateParticipant(UUID threadId, Integer studentId, ThreadParticipantDTO participantDTO) {
        ThreadParticipantId id = new ThreadParticipantId(threadId, studentId);
        ThreadParticipant participant = threadParticipantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        participant.setId(new ThreadParticipantId(participantDTO.getThreadId(), participantDTO.getStudentId()));
        ThreadParticipant updated = threadParticipantRepository.save(participant);
        return dtoMapper.toThreadParticipantDTO(updated);
    }

    @Transactional
    public void deleteParticipant(UUID threadId, Integer studentId) {
        ThreadParticipantId id = new ThreadParticipantId(threadId, studentId);
        if (!threadParticipantRepository.existsById(id)) {
            throw new IllegalArgumentException("Participant not found");
        }
        threadParticipantRepository.deleteById(id);
    }
}
