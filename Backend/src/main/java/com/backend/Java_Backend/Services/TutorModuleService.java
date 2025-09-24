package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.ModuleDTO;
import com.backend.Java_Backend.DTO.TutorDTO;
import com.backend.Java_Backend.DTO.TutorModuleDTO;
import com.backend.Java_Backend.DTO.TutorWithModulesDTO;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.TutorModule;
import com.backend.Java_Backend.Models.TutorModuleId;
import com.backend.Java_Backend.Repository.ModuleRepository;
import com.backend.Java_Backend.Repository.TutorModuleRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TutorModuleService {
    @Autowired
    private TutorModuleRepository repository;
    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private TutorService tutorService;

    public TutorModuleDTO create(TutorModuleDTO dto) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(dto.getTutorId());
        Optional<Modules> moduleOpt = moduleRepository.findById(dto.getModuleId());
        if (tutorOpt.isEmpty() || moduleOpt.isEmpty()) {
            return null;
        }
        Optional<TutorModule> existing = repository.findById(new TutorModuleId(dto.getTutorId(), dto.getModuleId()));
        if (existing.isPresent()) {
            return null;
        }
        TutorModule tutorModule = new TutorModule(tutorOpt.get(), moduleOpt.get());
        repository.save(tutorModule);
        return new TutorModuleDTO(tutorModule.getTutor().getId(), tutorModule.getModule().getId());
    }

    public List<TutorModuleDTO> findAll() {
        return repository.findAll().stream()
                .map(tm -> new TutorModuleDTO(tm.getTutor().getId(), tm.getModule().getId()))
                .collect(Collectors.toList());
    }

    public TutorModuleDTO findById(int tutorId, int moduleId) {
        Optional<TutorModule> tutorModuleOpt = repository.findById(new TutorModuleId(tutorId, moduleId));
        return tutorModuleOpt.map(tm -> new TutorModuleDTO(tm.getTutor().getId(), tm.getModule().getId()))
                .orElse(null);
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

    public TutorWithModulesDTO findByTutorIdWithDetails(int tutorId) {
        TutorDTO tutor = tutorService.getTutorById(tutorId);
        if (tutor == null) {
            return null;
        }
        List<ModuleDTO> modules = repository.findByTutorId(tutorId).stream()
                .map(tm -> moduleRepository.findById(tm.getModule().getId())
                        .map(m -> new ModuleDTO(m.getId(), m.getModule_code(), m.getModule_name(), m.getDescription()))
                        .orElse(null))
                .filter(m -> m != null)
                .collect(Collectors.toList());
        return new TutorWithModulesDTO(tutor, modules);
    }

    public TutorWithModulesDTO findByTutorIdAndModuleIdWithDetails(int tutorId, int moduleId) {
        TutorDTO tutor = tutorService.getTutorById(tutorId);
        if (tutor == null) {
            return null;
        }
        Optional<TutorModule> tutorModuleOpt = repository.findById(new TutorModuleId(tutorId, moduleId));
        if (tutorModuleOpt.isEmpty()) {
            return new TutorWithModulesDTO(tutor, List.of());
        }
        ModuleDTO module = moduleRepository.findById(moduleId)
                .map(m -> new ModuleDTO(m.getId(), m.getModule_code(), m.getModule_name(), m.getDescription()))
                .orElse(null);
        if (module == null) {
            return new TutorWithModulesDTO(tutor, List.of());
        }
        return new TutorWithModulesDTO(tutor, List.of(module));
    }

    public TutorModuleDTO update(int tutorId, int moduleId, TutorModuleDTO dto) {
        Optional<TutorModule> existing = repository.findById(new TutorModuleId(tutorId, moduleId));
        if (existing.isEmpty()) {
            return null;
        }
        delete(tutorId, moduleId);
        return create(dto);
    }

    public boolean delete(int tutorId, int moduleId) {
        if (repository.existsById(new TutorModuleId(tutorId, moduleId))) {
            repository.deleteById(new TutorModuleId(tutorId, moduleId));
            return true;
        }
        return false;
    }
}
