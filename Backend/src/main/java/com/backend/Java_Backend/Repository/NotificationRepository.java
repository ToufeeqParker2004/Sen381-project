package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
}
