package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Admin;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.AdminRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import com.backend.Java_Backend.Security.JwtUtil;
import com.backend.Java_Backend.Security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class AuthService {
    private static final Logger LOGGER = Logger.getLogger(AuthService.class.getName());

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public String login(String identifier, String password) {
        LOGGER.info("Login attempt: identifier=" + identifier);
        Optional<Admin> adminOpt = adminRepository.findByUsername(identifier);
        LOGGER.info("Admin found: " + adminOpt.isPresent());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            boolean passwordMatch = PasswordHasher.verifyPassword(password, admin.getPassword());
            LOGGER.info("Admin password match: " + passwordMatch);
            if (passwordMatch) {
                return jwtUtil.generateToken(admin.getId(), admin.getUsername(), List.of("ADMIN"));
            }
        }

        Optional<Student> studentOpt = studentRepository.findByEmail(identifier);
        LOGGER.info("Student found: " + studentOpt.isPresent());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            boolean passwordMatch = PasswordHasher.verifyPassword(password, student.getPassword());
            LOGGER.info("Student password match: " + passwordMatch);
            if (passwordMatch) {
                Optional<Tutor> tutorOpt = tutorRepository.findByStudent_id(student.getId());
                LOGGER.info("Tutor found: " + tutorOpt.isPresent());
                List<String> roles = tutorOpt.isPresent() ? List.of("STUDENT", "TUTOR") : List.of("STUDENT");
                return jwtUtil.generateToken(student.getId(), student.getEmail(), roles);
            }
        }

        LOGGER.warning("Login failed for identifier: " + identifier);
        return null;
    }

    public boolean updatePassword(Integer id, String password) {
        // Input validation
        if (id == null || password == null || password.trim().isEmpty()) {
            return false;
        }

        Optional<Student> studentOpt = studentRepository.findById(id);

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            String hashedPassword = PasswordHasher.hashPassword(password);
            student.setPassword(hashedPassword);
            studentRepository.save(student);
            return true;
        } else {
            return false;
        }
    }
}
