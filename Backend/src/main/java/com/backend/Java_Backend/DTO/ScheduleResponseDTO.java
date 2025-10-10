package com.backend.Java_Backend.DTO;

import java.time.LocalTime;
import java.util.UUID;

public class ScheduleResponseDTO {
    private String dayOfWeek;
    private Slot[] slots;

    public static class Slot {
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isBooked;
        private UUID bookingId;
        private Integer studentId;

        // Getters and Setters

        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }

        public Boolean getBooked() {
            return isBooked;
        }

        public void setBooked(Boolean booked) {
            isBooked = booked;
        }

        public UUID getBookingId() {
            return bookingId;
        }

        public void setBookingId(UUID bookingId) {
            this.bookingId = bookingId;
        }

        public Integer getStudentId() {
            return studentId;
        }

        public void setStudentId(Integer studentId) {
            this.studentId = studentId;
        }
    }

    // Getters and Setters

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Slot[] getSlots() {
        return slots;
    }

    public void setSlots(Slot[] slots) {
        this.slots = slots;
    }
}
