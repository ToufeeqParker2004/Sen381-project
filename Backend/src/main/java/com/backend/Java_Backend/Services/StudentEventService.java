package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Events;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentEvent;
import com.backend.Java_Backend.Models.StudentEventId;
import com.backend.Java_Backend.Repository.EventRepository;
import com.backend.Java_Backend.Repository.StudentEventRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentEventService {

    @Autowired
    private StudentEventRepository studentEventRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public StudentEvent registerForEvent(Long studentId, UUID eventId) {
        // Check if already registered
        if (studentEventRepository.existsByStudentIdAndEventId(studentId, eventId)) {
            throw new RuntimeException("Student is already registered for this event");
        }

        // Verify student exists
        Student student = studentRepository.findById(Math.toIntExact(studentId))
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Verify event exists
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Create and save registration
        StudentEvent studentEvent = new StudentEvent(student, event);
        return studentEventRepository.save(studentEvent);
    }

    @Transactional
    public void unregisterFromEvent(Long studentId, UUID eventId) {
        if (!studentEventRepository.existsByStudentIdAndEventId(studentId, eventId)) {
            throw new RuntimeException("Student is not registered for this event");
        }
        studentEventRepository.deleteByStudentIdAndEventId(studentId, eventId);
    }

    public List<Events> getEventsByStudentId(Long studentId) {
        List<StudentEvent> studentEvents = studentEventRepository.findByStudentId(studentId);
        return studentEvents.stream()
                .map(StudentEvent::getEvent)
                .collect(Collectors.toList());
    }

    public List<Student> getStudentsByEventId(UUID eventId) {
        List<StudentEvent> studentEvents = studentEventRepository.findByEventId(eventId);
        return studentEvents.stream()
                .map(StudentEvent::getStudent)
                .collect(Collectors.toList());
    }

    public boolean isStudentRegisteredForEvent(Long studentId, UUID eventId) {
        return studentEventRepository.existsByStudentIdAndEventId(studentId, eventId);
    }

    public int getRegistrationCountForEvent(UUID eventId) {
        return studentEventRepository.countByEventId(eventId);
    }
}