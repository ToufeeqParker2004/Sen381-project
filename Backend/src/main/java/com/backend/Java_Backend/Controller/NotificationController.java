package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.Models.Notification;
import com.backend.Java_Backend.Models.NotificationSubscription;
import com.backend.Java_Backend.Services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get all notification
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // Get notification by ID
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable UUID id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        return notification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new notification
    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.saveNotification(notification);
    }

    // Update notification
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable UUID id, @RequestBody Notification updatedNotification) {
        return notificationService.getNotificationById(id).map(notification -> {
            notification.setUser_id(updatedNotification.getUser_id());
            notification.setMessage(updatedNotification.getMessage());
            notification.setNotification_type(updatedNotification.getNotification_type());
            notification.setStatus(updatedNotification.getStatus());
            notification.setCreated_at(updatedNotification.getCreated_at());
            return ResponseEntity.ok(notificationService.saveNotification(notification));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (notificationService.getNotificationById(id).isPresent()) {
            notificationService.deleteNotification(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, Boolean> payload, Authentication authentication) {
        try {
            Boolean subscribed = payload.get("subscribed");
            if (subscribed == null) {
                return ResponseEntity.badRequest().body("Missing 'subscribed' field");
            }

            // Convert userID from String to Integer
            String studentIdStr = (String) authentication.getPrincipal();
            Integer studentId = Integer.parseInt(studentIdStr);

            NotificationSubscription subscription = notificationService.getSubscription(studentId)
                    .orElse(new NotificationSubscription(studentId, subscribed));

            subscription.setSubscribed(subscribed);
            NotificationSubscription saved = notificationService.upsertSubscription(subscription);

            return ResponseEntity.ok(saved);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid student ID");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating subscription: " + e.getMessage());
        }
    }

    @GetMapping("/subscribed")
    public ResponseEntity<?> getStatusOfSubscription(Authentication authentication) {
        try {
            String studentIdStr = (String) authentication.getPrincipal();
            Integer studentId = Integer.parseInt(studentIdStr);

            Optional<NotificationSubscription> optionalStatus = notificationService.getSubscription(studentId);
            return optionalStatus
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Collections.singletonMap("error", "Subscription not found")));

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid student ID"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error getting subscription: " + e.getMessage()));
        }
    }

}
