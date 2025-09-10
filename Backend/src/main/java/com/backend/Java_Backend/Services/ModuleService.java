package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModuleService {
    private final ModuleRepository moduleRepository;

    @Autowired
    public ModuleService(ModuleRepository moduleRepository) {
        this.moduleRepository = moduleRepository;
    }

    // Get all Modules
    public List<Modules> getAllModules() {
        return moduleRepository.findAll();
    }

    // Get a Module by ID
    public Optional<Modules> getModuleById(int id) {
        return moduleRepository.findById(id);
    }

    // Save or update a Module
    public Modules saveModule(Modules module) {
        return moduleRepository.save(module);
    }

    // Delete a Module by ID
    public void deleteModule(int id) {
        moduleRepository.deleteById(id);
    }


}
