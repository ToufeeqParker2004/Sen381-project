package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.BookingDTO;
import com.backend.Java_Backend.DTO.UpdateStatusRequestDTO;
import com.backend.Java_Backend.Services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody BookingDTO dto) {
        return ResponseEntity.ok(bookingService.createBooking(dto));
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByTutor(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(bookingService.getBookingsByTutor(tutorId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/student/{studentID}")
    public ResponseEntity<List<BookingDTO>> getBookingsByStudent(@PathVariable Integer studentID) {
        return ResponseEntity.ok(bookingService.getBookingsByStudent(studentID));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable UUID bookingId,
            @RequestBody UpdateStatusRequestDTO request
    ) {
        try {
            BookingDTO updatedBooking = bookingService.updateStatus(bookingId, request.getStatus());
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(null);
        }
    }
}
