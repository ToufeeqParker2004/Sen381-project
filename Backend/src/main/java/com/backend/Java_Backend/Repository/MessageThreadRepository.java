package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;
@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, UUID> {
    Optional<MessageThread> findByThreadId(UUID threadId);

}
