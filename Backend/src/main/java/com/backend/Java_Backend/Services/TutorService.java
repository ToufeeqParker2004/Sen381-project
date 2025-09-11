package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.TutorModule;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorModuleRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TutorService {
    private final TutorRepository tutorRepository;
    private final TutorModuleRepository tutorModuleRepository;
    @Autowired
    public TutorService(TutorRepository tutorRepository,TutorModuleRepository tutorModuleRepository) {
        this.tutorRepository = tutorRepository;
        this.tutorModuleRepository = tutorModuleRepository;
    }

    // Get all students
    public List<Tutor> getAllTutors() {
        return tutorRepository.findAll();
    }

    // Get a student by ID
    public Optional<Tutor> getTutorById(int id) {
        return tutorRepository.findById(id);
    }

    // Save or update a student
    public Tutor saveTutor(Tutor tutor) {
        return tutorRepository.save(tutor);
    }

    // Delete a student by ID
    public void deleteTutor(int id) {
        tutorRepository.deleteById(id);
    }
    public List<Modules> getModulesForTutor(int tutorId) {
        List<TutorModule> assignments = tutorModuleRepository.findByTutorId(tutorId);
        List<Modules> modules = new ArrayList<>();
        for (TutorModule tm : assignments) {
            modules.add(tm.getModule());
        }
        return modules;
    }

    public TutorModule assignModule(Tutor tutor, Modules module) {
        TutorModule tm = new TutorModule(tutor, module);
        return tutorModuleRepository.save(tm);
    }

}
