// TutorService.java (updated with module management)
package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.TutorDTO;
import com.backend.Java_Backend.DTO.updateTutorDTO;
import com.backend.Java_Backend.Models.*;
import com.backend.Java_Backend.Repository.ModuleRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import com.backend.Java_Backend.Repository.TutorModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TutorService {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorModuleRepository tutorModuleRepository;

    @Autowired
    private ModuleRepository modulesRepository;

    public TutorDTO getTutorById(Integer id) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(id);
        return tutorOpt.map(tutor -> {
            Optional<Student> studentOpt = studentRepository.findById(tutor.getStudent_id());
            List<Integer> moduleIds = tutor.getTutorModules() != null ?
                    tutor.getTutorModules().stream()
                            .map(tm -> tm.getId().getModuleId())
                            .collect(Collectors.toList()) :
                    List.of();
            return new TutorDTO(
                    tutor.getId(),
                    tutor.getStudent_id(),
                    tutor.getCreated_at(),
                    studentOpt.map(Student::getEmail).orElse(null),
                    moduleIds
            );
        }).orElse(null);
    }

    public TutorDTO getTutorByStudentId(Integer studentId) {
        Optional<Tutor> tutorOpt = tutorRepository.findByStudent_id(studentId);
        return tutorOpt.map(tutor -> {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            List<Integer> moduleIds = tutor.getTutorModules() != null ?
                    tutor.getTutorModules().stream()
                            .map(tm -> tm.getId().getModuleId())
                            .collect(Collectors.toList()) :
                    List.of();
            return new TutorDTO(
                    tutor.getId(),
                    studentId,
                    tutor.getCreated_at(),
                    studentOpt.map(Student::getEmail).orElse(null),
                    moduleIds
            );
        }).orElse(null);
    }

    public boolean deleteTutor(Integer id) {
        if (tutorRepository.existsById(id)) {
            tutorRepository.deleteById(id); // Cascades to TutorModule via DB constraints
            return true;
        }
        return false;
    }

    public TutorDTO createTutor(Integer studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return null;
        }
        Optional<Tutor> existingTutor = tutorRepository.findByStudent_id(studentId);
        if (existingTutor.isPresent()) {
            return null;
        }
        Tutor tutor = new Tutor(new Timestamp(System.currentTimeMillis()), studentId);
        tutor = tutorRepository.save(tutor);
        return new TutorDTO(
                tutor.getId(),
                studentId,
                tutor.getCreated_at(),
                studentOpt.get().getEmail(),
                List.of()
        );
    }

    public TutorDTO updateTutor(Integer id, updateTutorDTO updateDTO) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(id);
        return tutorOpt.map(tutor -> {
            if (updateDTO.getCreated_at() != null) {
                tutor.setCreated_at(updateDTO.getCreated_at());
            }
            tutorRepository.save(tutor);
            Optional<Student> studentOpt = studentRepository.findById(tutor.getStudent_id());
            List<Integer> moduleIds = tutor.getTutorModules() != null ?
                    tutor.getTutorModules().stream()
                            .map(tm -> tm.getId().getModuleId())
                            .collect(Collectors.toList()) :
                    List.of();
            return new TutorDTO(
                    tutor.getId(),
                    tutor.getStudent_id(),
                    tutor.getCreated_at(),
                    studentOpt.map(Student::getEmail).orElse(null),
                    moduleIds
            );
        }).orElse(null);
    }

    public List<TutorDTO> getAllTutors() {
        return tutorRepository.findAll().stream()
                .map(tutor -> {
                    Optional<Student> studentOpt = studentRepository.findById(tutor.getStudent_id());
                    List<Integer> moduleIds = tutor.getTutorModules() != null ?
                            tutor.getTutorModules().stream()
                                    .map(tm -> tm.getId().getModuleId())
                                    .collect(Collectors.toList()) :
                            List.of();
                    return new TutorDTO(
                            tutor.getId(),
                            tutor.getStudent_id(),
                            tutor.getCreated_at(),
                            studentOpt.map(Student::getEmail).orElse(null),
                            moduleIds
                    );
                })
                .collect(Collectors.toList());
    }

    public TutorDTO assignModuleToTutor(Integer tutorId, Integer moduleId) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        Optional<Modules> moduleOpt = modulesRepository.findById(moduleId);
        if (tutorOpt.isEmpty() || moduleOpt.isEmpty()) {
            return null;
        }
        Tutor tutor = tutorOpt.get();
        Modules module = moduleOpt.get();
        Optional<TutorModule> existing = tutorModuleRepository.findById(new TutorModuleId(tutorId, moduleId));
        if (existing.isPresent()) {
            return getTutorById(tutorId); // Already assigned
        }
        TutorModule tutorModule = new TutorModule(tutor, module);
        tutorModuleRepository.save(tutorModule);
        return getTutorById(tutorId);
    }

    public TutorDTO removeModuleFromTutor(Integer tutorId, Integer moduleId) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isEmpty()) {
            return null;
        }
        tutorModuleRepository.deleteByIdTutorIdAndIdModuleId(tutorId, moduleId);
        return getTutorById(tutorId);
    }
}
