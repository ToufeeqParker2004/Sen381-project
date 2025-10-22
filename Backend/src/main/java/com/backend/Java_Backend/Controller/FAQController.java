package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.FAQCategoryResponse;
import com.backend.Java_Backend.DTO.FAQRequest;
import com.backend.Java_Backend.Models.Faq;
import com.backend.Java_Backend.Services.FAQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FAQController {

    @Autowired
    private FAQService faqService;

    // Get all FAQs grouped by category (for your frontend)
    @GetMapping("/grouped")
    public ResponseEntity<?> getAllFAQsGroupedByCategory() {
        try {
            List<FAQCategoryResponse> faqs = faqService.getAllFAQsGroupedByCategory();
            return ResponseEntity.ok(faqs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to retrieve FAQs: " + e.getMessage()));
        }
    }

    // Get all FAQs (simple list)
    @GetMapping
    public ResponseEntity<?> getAllFAQs() {
        try {
            List<Faq> faqs = faqService.getAllFAQs();
            return ResponseEntity.ok(faqs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to retrieve FAQs: " + e.getMessage()));
        }
    }

    // Get FAQ by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getFAQById(@PathVariable Integer id) {
        try {
            Faq faq = faqService.getFAQById(id);
            if (faq != null) {
                return ResponseEntity.ok(faq);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to retrieve FAQ: " + e.getMessage()));
        }
    }

    // Create new FAQ
    @PostMapping
    public ResponseEntity<?> createFAQ(@RequestBody FAQRequest faqRequest) {
        try {
            if (faqRequest.getQuestion() == null || faqRequest.getQuestion().trim().isEmpty() ||
                    faqRequest.getAnswer() == null || faqRequest.getAnswer().trim().isEmpty() ||
                    faqRequest.getCategory() == null || faqRequest.getCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Question, answer, and category are required"));
            }

            Faq createdFAQ = faqService.createFAQ(faqRequest);
            return ResponseEntity.ok(createdFAQ);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to create FAQ: " + e.getMessage()));
        }
    }

    // Update FAQ
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFAQ(@PathVariable Integer id, @RequestBody FAQRequest faqRequest) {
        try {
            if (faqRequest.getQuestion() == null || faqRequest.getQuestion().trim().isEmpty() ||
                    faqRequest.getAnswer() == null || faqRequest.getAnswer().trim().isEmpty() ||
                    faqRequest.getCategory() == null || faqRequest.getCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Question, answer, and category are required"));
            }

            Faq updatedFAQ = faqService.updateFAQ(id, faqRequest);
            if (updatedFAQ != null) {
                return ResponseEntity.ok(updatedFAQ);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to update FAQ: " + e.getMessage()));
        }
    }

    // Delete FAQ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFAQ(@PathVariable Integer id) {
        try {
            boolean deleted = faqService.deleteFAQ(id);
            if (deleted) {
                return ResponseEntity.ok(Collections.singletonMap("message", "FAQ deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to delete FAQ: " + e.getMessage()));
        }
    }

    // Search FAQs
    @GetMapping("/search")
    public ResponseEntity<?> searchFAQs(@RequestParam String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Search query is required"));
            }

            List<Faq> results = faqService.searchFAQs(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to search FAQs: " + e.getMessage()));
        }
    }

    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        try {
            List<String> categories = faqService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Failed to retrieve categories: " + e.getMessage()));
        }
    }
}