package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Repository.ModuleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ModuleService {
    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<ModuleDTO> getAllModules() {
        return moduleRepository.findAll().stream()
                .map(module -> modelMapper.map(module, ModuleDTO.class))
                .collect(Collectors.toList());
    }

    public ModuleWithStudentsDTO getModuleWithStudents(Integer moduleId) {
        Modules module = moduleRepository.findByIdWithStudents(moduleId);
        if (module == null) {
            return null;
        }
        ModuleWithStudentsDTO dto = modelMapper.map(module, ModuleWithStudentsDTO.class);
        List<StudentDTO> studentDTOs = module.getStudentModules().stream()
                .map(sm -> modelMapper.map(sm.getStudent(), StudentDTO.class))
                .collect(Collectors.toList());
        dto.setStudents(studentDTOs);
        return dto;
    }

    public ModuleDTO createModule(CreateModuleDTO createDTO) {
        Modules module = modelMapper.map(createDTO, Modules.class);
        Modules savedModule = moduleRepository.save(module);
        return modelMapper.map(savedModule, ModuleDTO.class);
    }

    public ModuleDTO updateModule(Integer id, UpdateModuleDTO updateDTO) {
        Optional<Modules> optionalModule = moduleRepository.findById(id);
        if (optionalModule.isEmpty()) {
            return null;
        }
        Modules module = optionalModule.get();
        modelMapper.map(updateDTO, module);
        Modules updatedModule = moduleRepository.save(module);
        return modelMapper.map(updatedModule, ModuleDTO.class);
    }

    public boolean deleteModule(Integer id) {
        if (!moduleRepository.existsById(id)) {
            return false;
        }
        moduleRepository.deleteById(id);
        return true;
    }

    public ModuleDTO getModuleById(Integer id) {
        Optional<Modules> optionalModule = moduleRepository.findById(id);
        return optionalModule.map(module -> modelMapper.map(module, ModuleDTO.class)).orElse(null);
    }
}
