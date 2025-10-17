package com.backend.Java_Backend.Controller;



import com.backend.Java_Backend.DTO.ErrorDto;
import com.backend.Java_Backend.Services.ErrorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/errors")
public class ErrorController {

    private final ErrorService errorService;

    @Autowired
    public ErrorController(ErrorService errorService) {
        this.errorService = errorService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllErrors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<ErrorDto> errors = errorService.getErrorsPaginated(page, size);
        long totalErrors = errorService.getTotalErrorCount();
        boolean hasMore = (long) (page + 1) * size < totalErrors;

        Map<String, Object> response = new HashMap<>();
        response.put("errors", errors);
        response.put("page", page);
        response.put("size", size);
        response.put("total", totalErrors);
        response.put("hasMore", hasMore);

        return ResponseEntity.ok(response);
    }

    // Keep your existing endpoints for backward compatibility
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<ErrorDto>> getAllErrorsWithoutPagination() {
        List<ErrorDto> errors = errorService.getAllErrors();
        return ResponseEntity.ok(errors);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ErrorDto> getErrorById(@PathVariable UUID id) {
        ErrorDto error = errorService.getErrorById(id);
        return ResponseEntity.ok(error);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteErrorById(@PathVariable UUID id) {
        errorService.deleteErrorById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
