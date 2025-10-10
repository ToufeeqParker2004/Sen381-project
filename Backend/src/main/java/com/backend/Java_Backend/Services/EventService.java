package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Events;
import com.backend.Java_Backend.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Events createEvent(Events event) {

        return eventRepository.save(event);
    }

    public List<Events> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Events> getEventById(UUID id) {
        return eventRepository.findById(id);
    }

    public List<Events> getEventsByTutorId(Long tutorId) {
        return eventRepository.findByTutorId(tutorId);
    }

    public Events updateEvent(UUID id, Events eventDetails) {
        Optional<Events> eventOptional = eventRepository.findById(id);
        if (eventOptional.isPresent()) {
            Events event = eventOptional.get();
            event.setStart_time(eventDetails.getStart_time());
            event.setEnd_time(eventDetails.getEnd_time());
            event.setLocation(eventDetails.getLocation());
            event.setPresenter(eventDetails.getPresenter());
            event.setTitle(eventDetails.getTitle());
            event.setDate(eventDetails.getDate());
            event.setTutor_id(eventDetails.getTutor_id());
            return eventRepository.save(event);
        }
        return null;
    }

    public boolean deleteEvent(UUID id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
