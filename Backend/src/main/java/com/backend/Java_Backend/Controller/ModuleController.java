package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.CreateModuleDTO;
import com.backend.Java_Backend.DTO.ModuleDTO;
import com.backend.Java_Backend.DTO.ModuleWithStudentsDTO;
import com.backend.Java_Backend.DTO.UpdateModuleDTO;
import com.backend.Java_Backend.Services.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/modules")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    // Get all modules
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAllModules() {
        List<ModuleDTO> modules = moduleService.getAllModules();
        return ResponseEntity.ok(modules);
    }

    // Get a module by ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<?> getModuleById(@PathVariable Integer id) {
        ModuleDTO module = moduleService.getModuleById(id);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Module not found"));
        }
        return ResponseEntity.ok(module);
    }

    // Get a module with its students
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/students")
    public ResponseEntity<?> getModuleWithStudents(@PathVariable Integer id) {
        ModuleWithStudentsDTO module = moduleService.getModuleWithStudents(id);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Module not found"));
        }
        return ResponseEntity.ok(module);
    }

    // Create a new module
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createModule(@RequestBody CreateModuleDTO createDTO) {
        try {
            ModuleDTO module = moduleService.createModule(createDTO);
            return ResponseEntity.ok(module);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Failed to create module: " + e.getMessage()));
        }
    }

    // Update an existing module
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateModule(@PathVariable Integer id, @RequestBody UpdateModuleDTO updateDTO) {
        ModuleDTO module = moduleService.updateModule(id, updateDTO);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Module not found"));
        }
        return ResponseEntity.ok(module);
    }

    // Delete a module
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModule(@PathVariable Integer id) {
        boolean deleted = moduleService.deleteModule(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Module not found"));
        }
        return ResponseEntity.noContent().build();
    }
}
