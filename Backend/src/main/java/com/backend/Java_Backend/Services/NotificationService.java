package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Notification;
import com.backend.Java_Backend.Models.NotificationSubscription;
import com.backend.Java_Backend.Repository.NotificationRepository;
import com.backend.Java_Backend.Repository.SubscribeNotiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SubscribeNotiRepository subscribeNoti;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, SubscribeNotiRepository subscribeNoti) {
        this.notificationRepository = notificationRepository;
        this.subscribeNoti = subscribeNoti;
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

    // Upsert subscription
    public NotificationSubscription upsertSubscription(NotificationSubscription subscription) {
        return subscribeNoti.findByStudentID(subscription.getStudentID())
                .map(existing -> {
                    existing.setSubscribed(subscription.getSubscribed());
                    return subscribeNoti.save(existing);
                })
                .orElseGet(() -> subscribeNoti.save(subscription));
    }

    public Optional<NotificationSubscription> getSubscription(Integer studentID) {
        return subscribeNoti.findByStudentID(studentID);
    }

}
