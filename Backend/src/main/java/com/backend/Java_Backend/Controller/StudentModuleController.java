package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.CreateStudentModuleDTO;
import com.backend.Java_Backend.DTO.StudentModuleDTO;
import com.backend.Java_Backend.DTO.UpdateStudentModuleDTO;
import com.backend.Java_Backend.Services.StudentModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/studentModules")
public class StudentModuleController {
    private static final Logger LOGGER = Logger.getLogger(StudentModuleController.class.getName());

    @Autowired
    private StudentModuleService studentModuleService;

    // Get all student-module mappings
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<StudentModuleDTO>> getAllStudentModules() {
        LOGGER.info("Fetching all student-module mappings");
        List<StudentModuleDTO> studentModules = studentModuleService.getAllStudentModules();
        return ResponseEntity.ok(studentModules);
    }

    // Get student-module mappings by student ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/student")
    public ResponseEntity<?> getStudentModulesByStudentId(Authentication authentication) {
        String studentIdStr = (String) authentication.getPrincipal();
        if (studentIdStr == null) {
            LOGGER.warning("Authentication principal is null");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Invalid user authentication"));
        }
        try {
            int studentId = Integer.parseInt(studentIdStr);
            LOGGER.info("Fetching student-module mappings for studentId: " + studentId);
            List<StudentModuleDTO> studentModules = studentModuleService.getStudentModulesByStudentId(studentId);
            return ResponseEntity.ok(studentModules);
        } catch (NumberFormatException e) {
            LOGGER.warning("Invalid principal format: " + studentIdStr);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Invalid user ID"));
        }
    }

    // Get student-module mappings by module ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<?> getStudentModulesByModuleId(@PathVariable Integer moduleId) {
        LOGGER.info("Fetching student-module mappings for moduleId: " + moduleId);
        if (moduleId == null) {
            LOGGER.warning("Module ID is null");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Module ID is required"));
        }
        List<StudentModuleDTO> studentModules = studentModuleService.getStudentModulesByModuleId(moduleId);
        return ResponseEntity.ok(studentModules);
    }

    // Create a new student-module mapping
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#createDTO.studentId, 'StudentModule', 'own')")
    @PostMapping
    public ResponseEntity<?> createStudentModule(@RequestBody CreateStudentModuleDTO createDTO) {
        LOGGER.info("Creating student-module mapping for studentId: " + createDTO.getStudentId());
        StudentModuleDTO studentModule = studentModuleService.createStudentModule(createDTO);
        if (studentModule == null) {
            LOGGER.warning("Failed to create student-module mapping: already exists or invalid data");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Failed to create student-module mapping: already exists or invalid data"));
        }
        return ResponseEntity.ok(studentModule);
    }

    // Update an existing student-module mapping
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#studentId, 'StudentModule', 'own')")
    @PutMapping("/student/{studentId}/module/{moduleId}")
    public ResponseEntity<?> updateStudentModule(
            @PathVariable Integer studentId,
            @PathVariable Integer moduleId,
            @RequestBody UpdateStudentModuleDTO updateDTO) {
        LOGGER.info("Updating student-module mapping for studentId: " + studentId + ", moduleId: " + moduleId);
        if (studentId == null || moduleId == null) {
            LOGGER.warning("Student ID or Module ID is null");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Student ID and Module ID are required"));
        }
        StudentModuleDTO studentModule = studentModuleService.updateStudentModule(studentId, moduleId, updateDTO);
        if (studentModule == null) {
            LOGGER.warning("Student-module mapping not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student-module mapping not found"));
        }
        return ResponseEntity.ok(studentModule);
    }

    // Delete a student-module mapping
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#studentId, 'StudentModule', 'own')")
    @DeleteMapping("/student/{studentId}/module/{moduleId}")
    public ResponseEntity<?> deleteStudentModule(@PathVariable Integer studentId, @PathVariable Integer moduleId) {
        LOGGER.info("Deleting student-module mapping for studentId: " + studentId + ", moduleId: " + moduleId);
        if (studentId == null || moduleId == null) {
            LOGGER.warning("Student ID or Module ID is null");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Student ID and Module ID are required"));
        }
        boolean deleted = studentModuleService.deleteStudentModule(studentId, moduleId);
        if (!deleted) {
            LOGGER.warning("Student-module mapping not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Student-module mapping not found"));
        }
        return ResponseEntity.noContent().build();
    }
}