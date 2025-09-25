package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.TutorDTO;
import com.backend.Java_Backend.DTO.TutorModuleDTO;
import com.backend.Java_Backend.DTO.TutorWithModulesDTO;
import com.backend.Java_Backend.DTO.updateTutorDTO;
import com.backend.Java_Backend.Services.TutorModuleService;
import com.backend.Java_Backend.Services.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/tutors")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    @Autowired
    private TutorModuleService tutorModuleService;

    // Tutor endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllTutors() {
        List<TutorDTO> tutors = tutorService.getAllTutors();
        return ResponseEntity.ok(tutors);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'Tutor', 'own')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Integer id) {
        TutorDTO tutor = tutorService.getTutorById(id);
        if (tutor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found"));
        }
        return ResponseEntity.ok(tutor);
    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal == #studentId.toString()")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getTutorByStudentId(@PathVariable Integer studentId) {
        TutorDTO tutor = tutorService.getTutorByStudentId(studentId);
        if (tutor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found for student ID: " + studentId));
        }
        return ResponseEntity.ok(tutor);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createTutor(@RequestBody Integer studentId) {
        TutorDTO tutor = tutorService.createTutor(studentId);
        if (tutor == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid student ID or tutor already exists"));
        }
        return ResponseEntity.ok(tutor);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'Tutor', 'own')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTutor(@PathVariable Integer id, @RequestBody updateTutorDTO updateDTO) {
        TutorDTO updatedTutor = tutorService.updateTutor(id, updateDTO);
        if (updatedTutor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found"));
        }
        return ResponseEntity.ok(updatedTutor);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'Tutor', 'own')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTutor(@PathVariable Integer id) {
        boolean deleted = tutorService.deleteTutor(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found"));
        }
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String studentIdStr = (String) authentication.getPrincipal();
            int studentId = Integer.parseInt(studentIdStr);
            TutorDTO tutor = tutorService.getTutorByStudentId(studentId);
            if (tutor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Tutor profile not found"));
            }
            return ResponseEntity.ok(tutor);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid ID format"));
        }
    }

    // TutorModule endpoints
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules")
    public ResponseEntity<?> getAllTutorModules() {
        List<TutorModuleDTO> tutorModules = tutorModuleService.findAll();
        return ResponseEntity.ok(tutorModules);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#tutorId, 'Tutor', 'own')")
    @GetMapping("/{tutorId}/modules")
    public ResponseEntity<?> getTutorModulesByTutorId(@PathVariable Integer tutorId) {
        TutorWithModulesDTO result = tutorModuleService.findByTutorIdWithDetails(tutorId);
        if (result == null || result.getTutor() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found"));
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules/module/{moduleId}")
    public ResponseEntity<?> getTutorModulesByModuleId(@PathVariable Integer moduleId) {
        List<TutorModuleDTO> tutorModules = tutorModuleService.findByModuleId(moduleId);
        return ResponseEntity.ok(tutorModules);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#tutorId, 'Tutor', 'own')")
    @GetMapping("/{tutorId}/modules/{moduleId}")
    public ResponseEntity<?> getTutorModuleById(@PathVariable Integer tutorId, @PathVariable Integer moduleId) {
        TutorWithModulesDTO result = tutorModuleService.findByTutorIdAndModuleIdWithDetails(tutorId, moduleId);
        if (result == null || result.getTutor() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Tutor not found"));
        }
        if (result.getModules().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "TutorModule not found"));
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#tutorId, 'Tutor', 'own')")
    @PostMapping("/{tutorId}/modules")
    public ResponseEntity<?> createTutorModule(@PathVariable Integer tutorId, @RequestBody TutorModuleDTO dto) {
        if (!tutorId.equals(dto.getTutorId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Tutor ID in path and body must match"));
        }
        TutorModuleDTO created = tutorModuleService.create(dto);
        if (created == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid tutor or module ID, or already assigned"));
        }
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#tutorId, 'Tutor', 'own')")
    @PutMapping("/{tutorId}/modules/{moduleId}")
    public ResponseEntity<?> updateTutorModule(@PathVariable Integer tutorId, @PathVariable Integer moduleId, @RequestBody TutorModuleDTO dto) {
        if (!tutorId.equals(dto.getTutorId()) || !moduleId.equals(dto.getModuleId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Tutor ID and Module ID in path and body must match"));
        }
        TutorModuleDTO updated = tutorModuleService.update(tutorId, moduleId, dto);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "TutorModule not found"));
        }
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#tutorId, 'Tutor', 'own')")
    @DeleteMapping("/{tutorId}/modules/{moduleId}")
    public ResponseEntity<?> deleteTutorModule(@PathVariable Integer tutorId, @PathVariable Integer moduleId) {
        boolean deleted = tutorModuleService.delete(tutorId, moduleId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "TutorModule not found"));
        }
        return ResponseEntity.noContent().build();
    }
}
