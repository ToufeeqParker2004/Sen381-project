package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.BookingDTO;
import com.backend.Java_Backend.Services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
