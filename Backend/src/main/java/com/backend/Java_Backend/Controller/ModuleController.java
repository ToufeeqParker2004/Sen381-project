package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Services.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/module")
public class ModuleController {
    private final ModuleService moduleService;

    @Autowired
    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    // Get all modules
    @GetMapping
    public List<Modules> getAllModules() {
        return moduleService.getAllModules();
    }

    // Get a module by ID
    @GetMapping("/{id}")
    public ResponseEntity<Modules> getStudentById(@PathVariable int id) {
        Optional<Modules> module = moduleService.getModuleById(id);
        return module.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new module
    @PostMapping
    public Modules createModule(@RequestBody Modules module) {
        return moduleService.saveModule(module);
    }

    // Update module
    @PutMapping("/{id}")
    public ResponseEntity<Modules> updateModule(@PathVariable int id, @RequestBody Modules updatedModule) {
        return moduleService.getModuleById(id).map(module -> {
            module.setModule_code(updatedModule.getModule_code());
            module.setDescription(updatedModule.getDescription());
            return ResponseEntity.ok(moduleService.saveModule(module));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable int id) {
        if (moduleService.getModuleById(id).isPresent()) {
            moduleService.deleteModule(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


}
