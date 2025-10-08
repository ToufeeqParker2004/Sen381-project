package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.NotificationSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscribeNotiRepository extends JpaRepository<NotificationSubscription, UUID> {
    Optional<NotificationSubscription> findByStudentID(Integer studentID);
}
