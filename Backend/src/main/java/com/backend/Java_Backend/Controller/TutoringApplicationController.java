package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.TutoringApplicationDTO;
import com.backend.Java_Backend.Models.TutoringStudentApplication;
import com.backend.Java_Backend.Services.TutoringApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tutoring-applications")
public class TutoringApplicationController {

    @Autowired
    private TutoringApplicationService tutoringApplicationService;

    @PostMapping
    public ResponseEntity<TutoringStudentApplication> createApplication(@ModelAttribute TutoringApplicationDTO dto) {
        TutoringStudentApplication application = tutoringApplicationService.createApplication(dto);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/{id}/transcript")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> getTranscriptUrl(@PathVariable UUID id) {
        String url = tutoringApplicationService.getTranscriptUrl(id);
        return ResponseEntity.ok(url);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> approveApplication(@PathVariable UUID id) {
        tutoringApplicationService.approveApplication(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> declineApplication(@PathVariable UUID id) {
        tutoringApplicationService.declineApplication(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<TutoringStudentApplication>> getAllApplications() {
        List<TutoringStudentApplication> applications = tutoringApplicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutoringStudentApplication> getApplication(@PathVariable UUID id) {
        TutoringStudentApplication application = tutoringApplicationService.getApplication(id);
        return ResponseEntity.ok(application);
    }
}