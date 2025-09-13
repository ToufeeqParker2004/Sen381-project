package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.TutorDTO;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TutorService {
    @Autowired
    private TutorRepository repository;

    public TutorDTO create(TutorDTO dto) {
        if (dto.getStudentId() == 0) {
            throw new IllegalArgumentException("Student ID must be provided");
        }

        Tutor tutor = new Tutor();
        tutor.setCreated_at(Timestamp.from(Instant.now()));
        tutor.setStudent_id(dto.getStudentId());

        try {
            tutor = repository.save(tutor);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create tutor: " + e.getMessage(), e);
        }

        return new TutorDTO(tutor.getId(), tutor.getCreated_at(), tutor.getStudent_id(), List.of());
    }

    public List<TutorDTO> findAll() {
        return repository.findAll().stream()
                .map(tutor -> new TutorDTO(tutor.getId(), tutor.getCreated_at(), tutor.getStudent_id(),
                        tutor.getTutorModules() != null ?
                                tutor.getTutorModules().stream().map(tm -> tm.getModule().getId()).collect(Collectors.toList()) :
                                List.of()))
                .collect(Collectors.toList());
    }

    public TutorDTO findById(int id) {
        Tutor tutor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + id));
        return new TutorDTO(tutor.getId(), tutor.getCreated_at(), tutor.getStudent_id(),
                tutor.getTutorModules() != null ?
                        tutor.getTutorModules().stream().map(tm -> tm.getModule().getId()).collect(Collectors.toList()) :
                        List.of());
    }

    public List<TutorDTO> findByStudentId(int studentId) {
        return repository.findByStudent_id(studentId).stream()
                .map(tutor -> new TutorDTO(tutor.getId(), tutor.getCreated_at(), tutor.getStudent_id(),
                        tutor.getTutorModules() != null ?
                                tutor.getTutorModules().stream().map(tm -> tm.getModule().getId()).collect(Collectors.toList()) :
                                List.of()))
                .collect(Collectors.toList());
    }

    public TutorDTO update(int id, TutorDTO dto) {
        Tutor tutor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + id));
        if (dto.getCreatedAt() != null) {
            tutor.setCreated_at(dto.getCreatedAt());
        }
        if (dto.getStudentId() != 0) {
            tutor.setStudent_id(dto.getStudentId());
        }
        try {
            tutor = repository.save(tutor);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update tutor: " + e.getMessage(), e);
        }
        return new TutorDTO(tutor.getId(), tutor.getCreated_at(), tutor.getStudent_id(),
                tutor.getTutorModules() != null ?
                        tutor.getTutorModules().stream().map(tm -> tm.getModule().getId()).collect(Collectors.toList()) :
                        List.of());
    }

    public void delete(int id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Tutor not found with ID: " + id);
        }
        try {
            repository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete tutor: " + e.getMessage(), e);
        }
    }
}
