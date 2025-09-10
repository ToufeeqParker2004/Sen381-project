package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByThread_ThreadId(UUID threadId);
}
