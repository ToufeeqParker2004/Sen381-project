package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.AvailabilityDTO;
import com.backend.Java_Backend.DTO.AvailabilityUpdateRequest;
import com.backend.Java_Backend.DTO.ScheduleResponseDTO;
import com.backend.Java_Backend.Services.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/availabilities")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<AvailabilityDTO>> getAvailabilitiesByTutor(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(availabilityService.getAvailabilitiesByTutor(tutorId));
    }
    @PreAuthorize("hasAnyRole('Tutor','ADMIN')")
    @PutMapping("/tutor/{tutorId}")
    public ResponseEntity<List<AvailabilityDTO>> updateAvailabilities(@PathVariable Integer tutorId,
                                                                      @RequestBody AvailabilityUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateAvailabilities(tutorId, request));
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tutor/{tutorId}/schedule")
    public ResponseEntity<Map<String, ScheduleResponseDTO>> getTutorSchedule(
            @PathVariable Integer tutorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(availabilityService.getTutorSchedule(tutorId, startDate, endDate));
    }
}
