package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopicRepository extends JpaRepository<Topic,Integer> {
}
