package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.Modules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Modules,Integer> {
    List<Message> findByThreadID(UUID threadID);
}
