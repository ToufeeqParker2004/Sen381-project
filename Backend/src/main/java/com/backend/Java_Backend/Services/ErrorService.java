package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.DTO.ErrorDto;
import com.backend.Java_Backend.Models.ErrorEntity;
import com.backend.Java_Backend.Repository.ErrorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

        // Convert ErrorEntity to ErrorDto
        private ErrorDto convertToDto(ErrorEntity errorEntity) {
            return new ErrorDto(
                    errorEntity.getId(),
                    errorEntity.getCreatedAt(),
                    errorEntity.getMessage(),
                    errorEntity.getStackTrace(),
                    errorEntity.getEndpoint(),
                    errorEntity.getUserId(),
                    errorEntity.getAdditionalInfo()
            );
        }

        // Get paginated errors
        public List<ErrorDto> getErrorsPaginated(int page, int size) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ErrorEntity> errorPage = errorRepository.findAll(pageable);

            return errorPage.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        // Get total error count
        public long getTotalErrorCount() {
            return errorRepository.count();
        }

        // Your existing methods
        public List<ErrorDto> getAllErrors() {
            return errorRepository.findAll().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        public ErrorDto getErrorById(UUID id) {
            ErrorEntity errorEntity = errorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error not found with id: " + id));
            return convertToDto(errorEntity);
        }

        public void deleteErrorById(UUID id) {
            if (!errorRepository.existsById(id)) {
                throw new RuntimeException("Error not found with id: " + id);
            }
            errorRepository.deleteById(id);
        }
}
