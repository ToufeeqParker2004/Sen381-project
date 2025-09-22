package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.ThreadParticipantDTO;
import com.backend.Java_Backend.DTO.DTOMapper;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.ThreadParticipant;
import com.backend.Java_Backend.Models.ThreadParticipantId;
import com.backend.Java_Backend.Repository.MessageThreadRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.ThreadParticipantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ThreadParticipantService {
    private final ThreadParticipantRepository threadParticipantRepository;
    private final StudentRepository studentRepository; // Added for fetching Student
    private final MessageThreadRepository messageThreadRepository; // Added for fetching MessageThread
    private final DTOMapper dtoMapper;

    public ThreadParticipantService(ThreadParticipantRepository threadParticipantRepository,
                                    StudentRepository studentRepository,
                                    MessageThreadRepository messageThreadRepository,
                                    DTOMapper dtoMapper) {
        this.threadParticipantRepository = threadParticipantRepository;
        this.studentRepository = studentRepository;
        this.messageThreadRepository = messageThreadRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional
    public ThreadParticipantDTO addParticipant(ThreadParticipantDTO participantDTO) {
        // Validate DTO inputs
        if (participantDTO.getThreadId() == null || participantDTO.getStudentId() == null) {
            throw new IllegalArgumentException("threadId and studentId must not be null");
        }

        // Fetch existing entities to populate relationships
        MessageThread thread = messageThreadRepository.findById(participantDTO.getThreadId())
                .orElseThrow(() -> new EntityNotFoundException("MessageThread not found for threadId: " + participantDTO.getThreadId()));

        Student student = studentRepository.findById(participantDTO.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found for studentId: " + participantDTO.getStudentId()));

        // Use mapper to create entity with id set
        ThreadParticipant participant = dtoMapper.toThreadParticipantEntity(participantDTO);

        // Manually set relationships (required for @MapsId)
        participant.setThread(thread);
        participant.setStudent(student);

        // Check for duplicate participant
        if (threadParticipantRepository.existsById(participant.getId())) {
            throw new IllegalArgumentException("Participant already exists for threadId: " + participantDTO.getThreadId() + " and studentId: " + participantDTO.getStudentId());
        }

        // Save and return mapped DTO
        ThreadParticipant savedParticipant = threadParticipantRepository.save(participant);
        return dtoMapper.toThreadParticipantDTO(savedParticipant);
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
        // Validate DTO inputs
        if (participantDTO.getThreadId() == null || participantDTO.getStudentId() == null) {
            throw new IllegalArgumentException("threadId and studentId must not be null");
        }

        // Fetch existing participant by original ID
        ThreadParticipantId existingId = new ThreadParticipantId(threadId, studentId);
        if (threadParticipantRepository.existsById(existingId)) {
            // Delete existing participant
            threadParticipantRepository.deleteById(existingId);
        }

        // Create new participant with new IDs
        MessageThread thread = messageThreadRepository.findById(participantDTO.getThreadId())
                .orElseThrow(() -> new EntityNotFoundException("MessageThread not found for threadId: " + participantDTO.getThreadId()));
        Student student = studentRepository.findById(participantDTO.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found for studentId: " + participantDTO.getStudentId()));

        ThreadParticipant participant = dtoMapper.toThreadParticipantEntity(participantDTO);
        participant.setThread(thread);
        participant.setStudent(student);

        // Check for duplicate
        if (threadParticipantRepository.existsById(participant.getId())) {
            throw new IllegalArgumentException("Participant already exists for threadId: " + participantDTO.getThreadId() + " and studentId: " + participantDTO.getStudentId());
        }

        // Save and return mapped DTO
        ThreadParticipant updated = threadParticipantRepository.save(participant);
        return dtoMapper.toThreadParticipantDTO(updated);
    }

    @Transactional
    public void deleteParticipant(UUID threadId, Integer studentId) {
        ThreadParticipantId id = new ThreadParticipantId(threadId, studentId);
        if (!threadParticipantRepository.existsById(id)) {
            throw new EntityNotFoundException("Participant not found for threadId: " + threadId + " and studentId: " + studentId);
        }
        threadParticipantRepository.deleteById(id);
    }
}
