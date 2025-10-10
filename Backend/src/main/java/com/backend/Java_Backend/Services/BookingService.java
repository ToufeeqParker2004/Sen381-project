package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.BookingDTO;
import com.backend.Java_Backend.Models.Booking;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.BookingRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Create a new booking
    public BookingDTO createBooking(BookingDTO dto) {
        Tutor tutor = tutorRepository.findById(dto.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Booking booking = new Booking();
        booking.setTutor(tutor);
        booking.setStudent(student);
        booking.setStartDatetime(dto.getStartDatetime());
        booking.setEndDatetime(dto.getEndDatetime());
        booking.setStatus(dto.getStatus());

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    // Get all bookings for a tutor
    public List<BookingDTO> getBookingsByTutor(Integer tutorId) {
        tutorRepository.findById(tutorId).orElseThrow(() -> new RuntimeException("Tutor not found"));
        List<Booking> bookings = bookingRepository.findByTutorId(tutorId);
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setTutorId(booking.getTutor().getId());
        dto.setStudentId(booking.getStudent().getId());
        dto.setStartDatetime(booking.getStartDatetime());
        dto.setEndDatetime(booking.getEndDatetime());
        dto.setStatus(booking.getStatus());
        return dto;
    }
}
