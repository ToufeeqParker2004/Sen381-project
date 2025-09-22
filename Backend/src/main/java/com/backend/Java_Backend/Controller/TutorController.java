package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.TutorDTO;
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
    @Autowired
    private TutorService service;

    @PostMapping
    public ResponseEntity<TutorDTO> create(@RequestBody TutorDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<TutorDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorDTO> findById(@PathVariable int id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TutorDTO>> findByStudentId(@PathVariable int studentId) {
        return ResponseEntity.ok(service.findByStudentId(studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutorDTO> update(@PathVariable int id, @RequestBody TutorDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
