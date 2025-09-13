package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.TutorModuleDTO;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.TutorModule;
import com.backend.Java_Backend.Models.TutorModuleId;
import com.backend.Java_Backend.Repository.ModuleRepository;
import com.backend.Java_Backend.Repository.TutorModuleRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

public class TutorModuleService {
    @Autowired
    private TutorModuleRepository repository;
    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private ModuleRepository moduleRepository;

    public TutorModuleDTO create(TutorModuleDTO dto) {
        Tutor tutor = tutorRepository.findById(dto.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        Modules module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));
        TutorModule tutorModule = new TutorModule(tutor, module);
        repository.save(tutorModule);
        return new TutorModuleDTO(tutorModule.getTutor().getId(), tutorModule.getModule().getId());
    }

    public List<TutorModuleDTO> findAll() {
        return repository.findAll().stream()
                .map(tm -> new TutorModuleDTO(tm.getTutor().getId(), tm.getModule().getId()))
                .collect(Collectors.toList());
    }

    public TutorModuleDTO findById(int tutorId, int moduleId) {
        TutorModule tutorModule = repository.findById(new TutorModuleId(tutorId, moduleId))
                .orElseThrow(() -> new RuntimeException("TutorModule not found"));
        return new TutorModuleDTO(tutorModule.getTutor().getId(), tutorModule.getModule().getId());
    }

    public List<TutorModuleDTO> findByTutorId(int tutorId) {
        return repository.findByTutorId(tutorId).stream()
                .map(tm -> new TutorModuleDTO(tm.getTutor().getId(), tm.getModule().getId()))
                .collect(Collectors.toList());
    }

    public List<TutorModuleDTO> findByModuleId(int moduleId) {
        return repository.findByModuleId(moduleId).stream()
                .map(tm -> new TutorModuleDTO(tm.getTutor().getId(), tm.getModule().getId()))
                .collect(Collectors.toList());
    }

    public TutorModuleDTO update(int tutorId, int moduleId, TutorModuleDTO dto) {
        repository.findById(new TutorModuleId(tutorId, moduleId))
                .orElseThrow(() -> new RuntimeException("TutorModule not found"));
        delete(tutorId, moduleId); // Remove old mapping
        return create(dto); // Create new mapping with updated IDs
    }

    public void delete(int tutorId, int moduleId) {
        repository.deleteById(new TutorModuleId(tutorId, moduleId));
    }
}
