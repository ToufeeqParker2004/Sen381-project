package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    @Query("SELECT n FROM Notification n WHERE n.user_id = :userId ORDER BY n.created_at DESC")
    List<Notification> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT n FROM Notification n WHERE n.user_id = :userId AND n.status = 'unread' ORDER BY n.created_at DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Integer userId);
}
