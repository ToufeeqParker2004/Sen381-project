package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MessageThreadRepository extends JpaRepository<MessageThread, UUID> {

}
