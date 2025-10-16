package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.ErrorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ErrorRepository extends JpaRepository<ErrorEntity, UUID> {

}

