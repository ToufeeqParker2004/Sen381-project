package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.CreateStudentModuleDTO;
import com.backend.Java_Backend.DTO.StudentModuleDTO;
import com.backend.Java_Backend.DTO.UpdateStudentModuleDTO;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Models.StudentModuleId;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Repository.StudentModuleRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.ModuleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentModuleService {

    @Autowired
    private StudentModuleRepository studentModuleRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<StudentModuleDTO> getAllStudentModules() {
        return studentModuleRepository.findAll().stream()
                .map(sm -> modelMapper.map(sm, StudentModuleDTO.class))
                .collect(Collectors.toList());
    }

    public StudentModuleDTO createStudentModule(CreateStudentModuleDTO createDTO) {
        Optional<Student> studentOpt = studentRepository.findById(createDTO.getStudentId());
        Optional<Modules> moduleOpt = moduleRepository.findById(createDTO.getModuleId());

        if (studentOpt.isEmpty() || moduleOpt.isEmpty()) {
            return null;
        }

        if (studentModuleRepository.findByStudentIdAndModuleId(createDTO.getStudentId(), createDTO.getModuleId())==null) {
            return null;
        }

        // Manually create StudentModule since ModelMapper doesn't map fields
        StudentModule studentModule = new StudentModule(studentOpt.get(), moduleOpt.get());
        StudentModule savedStudentModule = studentModuleRepository.save(studentModule);
        return modelMapper.map(savedStudentModule, StudentModuleDTO.class);
    }

    public StudentModuleDTO updateStudentModule(Integer studentId, Integer moduleId, UpdateStudentModuleDTO updateDTO) {
        StudentModuleId id = new StudentModuleId(studentId, moduleId);
        Optional<StudentModule> optionalStudentModule = studentModuleRepository.findById(id);
        if (optionalStudentModule.isEmpty()) {
            return null;
        }
        StudentModule studentModule = optionalStudentModule.get();
        modelMapper.map(updateDTO, studentModule);
        StudentModule updatedStudentModule = studentModuleRepository.save(studentModule);
        return modelMapper.map(updatedStudentModule, StudentModuleDTO.class);
    }

    public boolean deleteStudentModule(Integer studentId, Integer moduleId) {
        StudentModuleId id = new StudentModuleId(studentId, moduleId);
        if (!studentModuleRepository.existsById(id)) {
            return false;
        }
        studentModuleRepository.deleteById(id);
        return true;
    }

    public List<StudentModuleDTO> getStudentModulesByStudentId(Integer studentId) {
        return studentModuleRepository.findByStudentId(studentId).stream()
                .map(sm -> modelMapper.map(sm, StudentModuleDTO.class))
                .collect(Collectors.toList());
    }

    public List<StudentModuleDTO> getStudentModulesByModuleId(Integer moduleId) {
        return studentModuleRepository.findByModuleId(moduleId).stream()
                .map(sm -> modelMapper.map(sm, StudentModuleDTO.class))
                .collect(Collectors.toList());
    }

}