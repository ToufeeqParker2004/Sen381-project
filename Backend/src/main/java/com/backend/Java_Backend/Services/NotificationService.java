package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Notification;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.NotificationRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Get all Notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get a Notification by ID
    public Optional<Notification> getNotificationById(UUID id) {
        return notificationRepository.findById(id);
    }

    // Save or update a Notification
    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Delete a Notification by ID
    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }


}
