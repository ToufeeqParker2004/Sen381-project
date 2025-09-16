package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import com.backend.Java_Backend.Security.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ModelMapper modelMapper;
    private final TutorRepository tutorRepository;

    public StudentService(StudentRepository studentRepository,
                          ModelMapper modelMapper,
                          TutorRepository tutorRepository) {
        this.studentRepository = studentRepository;
        this.modelMapper = modelMapper;
        this.tutorRepository = tutorRepository;
    }

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

    // Student login for auth
    public String login(String email, String password) {

        Student student = studentRepository.findByEmail(email);
        if (student == null) {
            return null; // email not found
        }

        // if (!passwordEncoder.matches(password, student.getPassword())) { return null; }
        if (!student.getPassword().equals(password)) { // current plaintext check
            return null;
        }

        // Determine roles
        List<String> roles = new ArrayList<>();
        roles.add("STUDENT");
        //roles.add("ADMIN");

        if (!tutorRepository.findByStudent_id(student.getId()).isEmpty()) {
            roles.add("TUTOR");
        }

        // Generate JWT token with roles
        return JwtUtil.generateToken(student.getId(), student.getEmail(), roles);
    }
}
