package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.AvailabilityDTO;
import com.backend.Java_Backend.DTO.AvailabilityUpdateRequest;
import com.backend.Java_Backend.DTO.ScheduleResponseDTO;
import com.backend.Java_Backend.Models.Availability;
import com.backend.Java_Backend.Models.Booking;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.AvailabilityRepository;
import com.backend.Java_Backend.Repository.BookingRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TutorRepository tutorRepository;

    private static final ZoneId SAST = ZoneId.of("Africa/Johannesburg");

    public List<AvailabilityDTO> getAvailabilitiesByTutor(Integer tutorId) {
        tutorRepository.findById(tutorId).orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));
        List<Availability> availabilities = availabilityRepository.findByTutorId(tutorId);
        System.out.println("getAvailabilitiesByTutor: Found " + availabilities.size() + " availabilities for tutorId=" + tutorId);
        availabilities.forEach(a -> System.out.println("Availability: id=" + a.getId() + ", tutor_id=" + a.getTutor().getId() +
                ", dayOfWeek=" + a.getDayOfWeek() + ", startTime=" + a.getStartTime() +
                ", endTime=" + a.getEndTime() + ", recurring=" + a.isRecurring()));
        return availabilities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<AvailabilityDTO> updateAvailabilities(Integer tutorId, AvailabilityUpdateRequest request) {
        if (!tutorId.equals(request.getTutorId())) {
            throw new RuntimeException("Tutor ID mismatch");
        }
        Tutor tutor = tutorRepository.findById(tutorId).orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));

        Set<Integer> seenDays = new HashSet<>();
        for (AvailabilityDTO dto : request.getAvailabilities()) {
            if (dto.getStartDate() == null && dto.getEndDate() == null) {
                Integer day = dto.getDayOfWeek();
                if (!seenDays.add(day)) {
                    throw new RuntimeException("Duplicate dayOfWeek in indefinite availabilities");
                }
                if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().equals(dto.getEndTime())) {
                    throw new RuntimeException("Invalid time range for dayOfWeek: " + day);
                }
            }
        }

        List<AvailabilityDTO> results = new ArrayList<>();
        boolean shouldReplace = request.getReplaceAll() || request.getAvailabilities().stream()
                .anyMatch(dto -> dto.getDayOfWeek() == null && dto.getStartDate() == null && dto.getEndDate() == null);
        if (shouldReplace) {
            List<Booking> conflictingBookings = bookingRepository.findByTutorId(tutorId).stream()
                    .filter(b -> b.getStatus().equals("pending") || b.getStatus().equals("accepted"))
                    .collect(Collectors.toList());
            if (!conflictingBookings.isEmpty()) {
                throw new RuntimeException("Cannot replace schedule due to existing bookings");
            }
            availabilityRepository.deleteAllIndefiniteByTutorId(tutorId);
        }

        for (AvailabilityDTO dto : request.getAvailabilities()) {
            if (dto.getStartDate() == null && dto.getEndDate() == null) {
                List<Availability> existing = dto.getDayOfWeek() == null
                        ? availabilityRepository.findIndefiniteEveryDayByTutorId(tutorId)
                        : availabilityRepository.findIndefiniteByTutorIdAndDayOfWeek(tutorId, dto.getDayOfWeek());
                if (existing.size() > 1) {
                    throw new RuntimeException("Multiple indefinite entries found for tutor " + tutorId + " and day " + dto.getDayOfWeek());
                }

                Availability availability = existing.isEmpty() ? new Availability() : existing.get(0);
                availability.setTutor(tutor);
                availability.setDayOfWeek(dto.getDayOfWeek());
                availability.setStartTime(dto.getStartTime());
                availability.setEndTime(dto.getEndTime());
                availability.setStartDate(null);
                availability.setEndDate(null);
                availability.setRecurring(dto.isRecurring());
                availability.setSlotDurationMinutes(dto.getSlotDurationMinutes());
                availability = availabilityRepository.save(availability);
                results.add(convertToDTO(availability));
            } else {
                Availability availability = new Availability();
                availability.setTutor(tutor);
                availability.setDayOfWeek(dto.getDayOfWeek());
                availability.setStartTime(dto.getStartTime());
                availability.setEndTime(dto.getEndTime());
                availability.setStartDate(dto.getStartDate());
                availability.setEndDate(dto.getEndDate());
                availability.setRecurring(dto.isRecurring());
                availability.setSlotDurationMinutes(dto.getSlotDurationMinutes());
                availability = availabilityRepository.save(availability);
                results.add(convertToDTO(availability));
            }
        }

        return results;
    }

    public Map<String, ScheduleResponseDTO> getTutorSchedule(Integer tutorId, LocalDate startDate, LocalDate endDate) {
        Tutor tutor = tutorRepository.findById(tutorId).orElseThrow(() -> new RuntimeException("Tutor not found with id: " + tutorId));
        System.out.println("Tutor found: id=" + tutor.getId());

        List<Availability> availabilities = availabilityRepository.findByTutorIdAndDateRange(tutorId, startDate, endDate);
        System.out.println("Availabilities found: " + availabilities.size());
        if (availabilities.isEmpty()) {
            System.out.println("No availabilities found for tutorId=" + tutorId + ", startDate=" + startDate + ", endDate=" + endDate);
            List<Availability> fallbackAvailabilities = availabilityRepository.findByTutorId(tutorId);
            System.out.println("Fallback: Found " + fallbackAvailabilities.size() + " availabilities for tutorId=" + tutorId);
            availabilities = new ArrayList<>(fallbackAvailabilities);
        }
        availabilities.forEach(a -> System.out.println("Availability: id=" + a.getId() + ", tutor_id=" + a.getTutor().getId() +
                ", dayOfWeek=" + a.getDayOfWeek() + ", startTime=" + a.getStartTime() +
                ", endTime=" + a.getEndTime() + ", recurring=" + a.isRecurring() +
                ", slotDurationMinutes=" + a.getSlotDurationMinutes()));

        Timestamp startTimestamp = Timestamp.valueOf(startDate.atStartOfDay());
        Timestamp endTimestamp = Timestamp.valueOf(endDate.atTime(23, 59, 59));
        List<Booking> bookings = bookingRepository.findByTutorIdAndDateRange(tutorId, startTimestamp, endTimestamp);
        System.out.println("Bookings found: " + bookings.size());
        bookings.forEach(b -> {
            ZonedDateTime startZoned = b.getStartDatetime().toLocalDateTime().atZone(ZoneId.of("UTC")).withZoneSameInstant(SAST);
            ZonedDateTime endZoned = b.getEndDatetime().toLocalDateTime().atZone(ZoneId.of("UTC")).withZoneSameInstant(SAST);
            System.out.println("Booking: id=" + b.getId() + ", start=" + startZoned + ", end=" + endZoned + ", status=" + b.getStatus());
        });

        Map<String, ScheduleResponseDTO> schedule = new TreeMap<>();
        String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

        final List<Availability> finalAvailabilities = availabilities;
        Stream.iterate(startDate, date -> !date.isAfter(endDate), date -> date.plusDays(1))
                .forEach(currentDate -> {
                    int dow = currentDate.getDayOfWeek().getValue() % 7; // 0=Sunday, ..., 6=Saturday
                    String dayName = days[dow];
                    List<ScheduleResponseDTO.Slot> slots = new ArrayList<>();
                    System.out.println("Processing date: " + currentDate + ", dow: " + dow);

                    List<Availability> applicableAvails = finalAvailabilities.stream()
                            .filter(a -> (a.getDayOfWeek() == null || a.getDayOfWeek() == dow) &&
                                    a.getStartTime() != null && a.getEndTime() != null)
                            .collect(Collectors.toList());
                    System.out.println("Applicable availabilities for " + currentDate + ": " + applicableAvails.size());

                    for (Availability avail : applicableAvails) {
                        LocalTime current = avail.getStartTime();
                        LocalTime endTime = avail.getEndTime();
                        System.out.println("Processing availability: startTime=" + current + ", endTime=" + endTime);
                        while (current != null && current.isBefore(endTime)) { // Changed to isBefore to include endTime
                            LocalTime slotEnd = current.plusMinutes(avail.getSlotDurationMinutes());
                            ZonedDateTime slotStartZoned = ZonedDateTime.of(currentDate, current, SAST);
                            ZonedDateTime slotEndZoned = ZonedDateTime.of(currentDate, slotEnd, SAST);
                            Timestamp slotStartTs = Timestamp.from(slotStartZoned.toInstant());
                            Timestamp slotEndTs = Timestamp.from(slotEndZoned.toInstant());
                            System.out.println("Slot: " + current + " to " + slotEnd + " (SAST), " +
                                    slotStartTs + " to " + slotEndTs + " (UTC)");

                            Optional<Booking> matchingBooking = bookings.stream()
                                    .filter(b -> (b.getStatus().equals("pending") || b.getStatus().equals("accepted")))
                                    .filter(b -> {
                                        ZonedDateTime bookingStart = b.getStartDatetime().toLocalDateTime().atZone(ZoneId.of("UTC")).withZoneSameInstant(SAST);
                                        ZonedDateTime bookingEnd = b.getEndDatetime().toLocalDateTime().atZone(ZoneId.of("UTC")).withZoneSameInstant(SAST);
                                        // Exact match for slot
                                        return bookingStart.equals(slotStartZoned) && bookingEnd.equals(slotEndZoned);
                                    })
                                    .findFirst();

                            ScheduleResponseDTO.Slot slot = new ScheduleResponseDTO.Slot();
                            slot.setStartTime(current);
                            slot.setEndTime(slotEnd);
                            slot.setBooked(matchingBooking.isPresent());
                            if (matchingBooking.isPresent()) {
                                slot.setBookingId(matchingBooking.get().getId());
                                slot.setStudentId(matchingBooking.get().getStudent().getId());
                                System.out.println("Booked slot: bookingId=" + matchingBooking.get().getId());
                            }
                            slots.add(slot);

                            current = slotEnd;
                        }
                    }

                    ScheduleResponseDTO response = new ScheduleResponseDTO();
                    response.setDayOfWeek(dayName);
                    response.setSlots(slots.toArray(new ScheduleResponseDTO.Slot[0]));
                    schedule.put(currentDate.toString(), response);
                    System.out.println("Slots for " + currentDate + ": " + slots.size());
                });

        return schedule;
    }

    private AvailabilityDTO convertToDTO(Availability availability) {
        AvailabilityDTO dto = new AvailabilityDTO();
        dto.setId(availability.getId());
        dto.setTutorId(availability.getTutor().getId());
        dto.setDayOfWeek(availability.getDayOfWeek());
        dto.setStartTime(availability.getStartTime());
        dto.setEndTime(availability.getEndTime());
        dto.setStartDate(availability.getStartDate());
        dto.setEndDate(availability.getEndDate());
        dto.setRecurring(availability.isRecurring());
        dto.setSlotDurationMinutes(availability.getSlotDurationMinutes());
        return dto;
    }
}
