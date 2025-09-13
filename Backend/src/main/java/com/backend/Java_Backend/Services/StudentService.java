package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Security.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(student -> modelMapper.map(student, StudentDTO.class))
                .collect(Collectors.toList());
    }

    public StudentWithModuleDTO getStudentWithModules(Integer studentId) {
        Student student = studentRepository.findByIdWithModules(studentId);
        if (student == null) {
            return null;
        }
        StudentWithModuleDTO dto = modelMapper.map(student, StudentWithModuleDTO.class);
        List<ModuleDTO> moduleDTOs = student.getStudentModules().stream()
                .map(sm -> modelMapper.map(sm.getModule(), ModuleDTO.class))
                .collect(Collectors.toList());
        dto.setModules(moduleDTOs);
        return dto;
    }

    public StudentDTO createStudent(CreateStudentDTO createDTO) {
        Student student = modelMapper.map(createDTO, Student.class);
        Student savedStudent = studentRepository.save(student);
        return modelMapper.map(savedStudent, StudentDTO.class);
    }

    public StudentDTO updateStudent(Integer id, UpdateStudentDTO updateDTO) {
        Optional<Student> optionalStudent = studentRepository.findById(id);
        if (optionalStudent.isEmpty()) {
            return null;
        }
        Student student = optionalStudent.get();
        modelMapper.map(updateDTO, student);
        Student updatedStudent = studentRepository.save(student);
        return modelMapper.map(updatedStudent, StudentDTO.class);
    }

    public boolean deleteStudent(Integer id) {
        if (!studentRepository.existsById(id)) {
            return false;
        }
        studentRepository.deleteById(id);
        return true;
    }

    public StudentDTO getStudentById(Integer id) {
        Optional<Student> optionalStudent = studentRepository.findById(id);
        return optionalStudent.map(student -> modelMapper.map(student, StudentDTO.class)).orElse(null);
    }

    //Student login for auth
    public String login(String email, String password) {
        // Get student directly
        Student student = studentRepository.findByEmail(email);

        if (student == null) {
            return null; // email not found
        }

        // Plaintext password check
        if (!student.getPassword().equals(password)) {
            return null; // wrong password
        }

        // Generate JWT token
        return JwtUtil.generateToken(student.getId(), student.getEmail());
    }
}
