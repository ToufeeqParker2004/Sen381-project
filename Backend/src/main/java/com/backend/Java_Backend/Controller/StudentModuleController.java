package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.CreateStudentModuleDTO;
import com.backend.Java_Backend.DTO.StudentModuleDTO;
import com.backend.Java_Backend.DTO.UpdateStudentModuleDTO;
import com.backend.Java_Backend.Services.StudentModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/studentModules")
public class StudentModuleController {

    @Autowired
    private StudentModuleService studentModuleService;

    @GetMapping
    public ResponseEntity<List<StudentModuleDTO>> getAllStudentModules() {
        List<StudentModuleDTO> studentModules = studentModuleService.getAllStudentModules();
        return ResponseEntity.ok(studentModules);
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentModuleDTO>> getStudentModulesByStudentId(Authentication authentication) {
        String studentIdStr = (String) authentication.getPrincipal();
        int studentId = Integer.parseInt(studentIdStr);
        List<StudentModuleDTO> studentModules = studentModuleService.getStudentModulesByStudentId(studentId);
        return ResponseEntity.ok(studentModules);
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<StudentModuleDTO>> getStudentModulesByModuleId(@PathVariable Integer moduleId) {
        List<StudentModuleDTO> studentModules = studentModuleService.getStudentModulesByModuleId(moduleId);
        return ResponseEntity.ok(studentModules);
    }

    @PostMapping
    public ResponseEntity<StudentModuleDTO> createStudentModule(@RequestBody CreateStudentModuleDTO createDTO) {
        StudentModuleDTO studentModule = studentModuleService.createStudentModule(createDTO);
        if (studentModule == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(studentModule);
    }

    @PutMapping("/student/{studentId}/module/{moduleId}")
    public ResponseEntity<StudentModuleDTO> updateStudentModule(
            @PathVariable Integer studentId,
            @PathVariable Integer moduleId,
            @RequestBody UpdateStudentModuleDTO updateDTO) {
        StudentModuleDTO studentModule = studentModuleService.updateStudentModule(studentId, moduleId, updateDTO);
        if (studentModule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(studentModule);
    }

    @DeleteMapping("/student/{studentId}/module/{moduleId}")
    public ResponseEntity<Void> deleteStudentModule(@PathVariable Integer studentId, @PathVariable Integer moduleId) {
        boolean deleted = studentModuleService.deleteStudentModule(studentId, moduleId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
