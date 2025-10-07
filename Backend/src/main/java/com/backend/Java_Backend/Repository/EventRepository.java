package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Events, UUID> {
}
