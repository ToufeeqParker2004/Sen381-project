package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Models.TutorModule;
import com.backend.Java_Backend.Services.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tutors")
public class TutorController {
    private final TutorService tutorService;

    @Autowired
    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    // Get all tutors
    @GetMapping
    public List<Tutor> getAllTutors() {
        return tutorService.getAllTutors();
    }

    // Get tutor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Tutor> getTutorById(@PathVariable int id) {
        Optional<Tutor> tutor = tutorService.getTutorById(id);
        return tutor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new tutor
    @PostMapping
    public Tutor createTutor(@RequestBody Tutor tutor) {
        return tutorService.saveTutor(tutor);
    }

    // Update tutor
    @PutMapping("/{id}")
    public ResponseEntity<Tutor> updateTutor(@PathVariable int id, @RequestBody Tutor updatedTutor) {
        return tutorService.getTutorById(id).map(tutor -> {
            tutor.setCreated_at(updatedTutor.getCreated_at());
            tutor.setStudent_id(updatedTutor.getStudent_id());

            return ResponseEntity.ok(tutorService.saveTutor(tutor));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable int id) {
        if (tutorService.getTutorById(id).isPresent()) {
            tutorService.deleteTutor(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    // Get modules taught by a tutor
    @GetMapping("/{tutorId}/modules")
    public ResponseEntity<List<Modules>> getModules(@PathVariable int tutorId) {
        List<Modules> modules = tutorService.getModulesForTutor(tutorId);
        if (modules.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(modules);
    }

    // Assign a module to a tutor
    @PostMapping("/{tutorId}/modules/{moduleId}")
    public TutorModule assignModule(@PathVariable int tutorId,
                                    @PathVariable int moduleId,
                                    @RequestBody Tutor tutor,  // pass tutor object or just ID
                                    @RequestBody Modules module) { // pass module object or just ID
        return tutorService.assignModule(tutor, module);
    }
}
