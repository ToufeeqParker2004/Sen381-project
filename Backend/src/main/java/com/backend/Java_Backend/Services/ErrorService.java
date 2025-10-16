package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.DTO.ErrorDto;
import com.backend.Java_Backend.Models.ErrorEntity;
import com.backend.Java_Backend.Repository.ErrorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ErrorService {

    private final ErrorRepository errorRepository;

    @Autowired
    public ErrorService(ErrorRepository errorRepository) {
        this.errorRepository = errorRepository;
    }

    public List<ErrorDto> getAllErrors() {
        return errorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ErrorDto getErrorById(UUID id) {
        ErrorEntity entity = errorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error not found with id: " + id));
        return mapToDto(entity);
    }

    public void deleteErrorById(UUID id) {
        if (!errorRepository.existsById(id)) {
            throw new RuntimeException("Error not found with id: " + id);
        }
        errorRepository.deleteById(id);
    }

    private ErrorDto mapToDto(ErrorEntity entity) {
        return new ErrorDto(
                entity.getId(),
                entity.getCreatedAt(),
                entity.getMessage(),
                entity.getStackTrace(),
                entity.getEndpoint(),
                entity.getUserId(), // Directly use userId (Long)
                entity.getAdditionalInfo()
        );
    }
}
