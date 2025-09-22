package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.CreateModuleDTO;
import com.backend.Java_Backend.DTO.ModuleDTO;
import com.backend.Java_Backend.DTO.ModuleWithStudentsDTO;
import com.backend.Java_Backend.DTO.UpdateModuleDTO;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Services.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/modules")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAllModules() {
        List<ModuleDTO> modules = moduleService.getAllModules();
        return ResponseEntity.ok(modules);
    }

    // fix for modules did in wrong controller lol
    @GetMapping("/student")
    public ResponseEntity<ModuleDTO> getModuleById(Authentication authentication) {
        String studentIdStr = (String) authentication.getPrincipal();
        int studentId = Integer.parseInt(studentIdStr);
        ModuleDTO module = moduleService.getModuleById(studentId);
        if (module == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(module);
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<ModuleWithStudentsDTO> getModuleWithStudents(@PathVariable Integer id) {
        ModuleWithStudentsDTO module = moduleService.getModuleWithStudents(id);
        if (module == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(module);
    }

    @PostMapping
    public ResponseEntity<ModuleDTO> createModule(@RequestBody CreateModuleDTO createDTO) {
        ModuleDTO module = moduleService.createModule(createDTO);
        return ResponseEntity.ok(module);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleDTO> updateModule(@PathVariable Integer id, @RequestBody UpdateModuleDTO updateDTO) {
        ModuleDTO module = moduleService.updateModule(id, updateDTO);
        if (module == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(module);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Integer id) {
        boolean deleted = moduleService.deleteModule(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }


}
