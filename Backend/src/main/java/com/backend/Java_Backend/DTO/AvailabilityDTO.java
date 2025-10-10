package com.backend.Java_Backend.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityDTO {
    private Integer id;
    private Integer tutorId;
    private Integer dayOfWeek; // 0=Sunday, ..., 6=Saturday, null for every day
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean recurring;
    private Integer slotDurationMinutes;

    // Getters and Setters
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public Integer getTutorId() {
        return tutorId;
    }
    public void setTutorId(Integer tutorId) {
        this.tutorId = tutorId;
    }
    public Integer getDayOfWeek() {
        return dayOfWeek;
    }
    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
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
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    public Boolean isRecurring() {
        return recurring;
    }
    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }
    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }
    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }
}
