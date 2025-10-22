package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.FAQCategoryResponse;
import com.backend.Java_Backend.DTO.FAQItem;
import com.backend.Java_Backend.DTO.FAQRequest;
import com.backend.Java_Backend.Models.Faq;
import com.backend.Java_Backend.Repository.FAQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FAQService {

    @Autowired
    private FAQRepository faqRepository;

    // Get all FAQs grouped by category (for your frontend)
    public List<FAQCategoryResponse> getAllFAQsGroupedByCategory() {
        List<String> categories = faqRepository.findDistinctCategories();

        return categories.stream().map(category -> {
            List<Faq> faqsInCategory = faqRepository.findByCategory(category);
            String color = faqsInCategory.isEmpty() ? "bg-blue-500" : faqsInCategory.get(0).getColor();

            List<FAQItem> faqItems = faqsInCategory.stream()
                    .map(faq -> new FAQItem(faq.getQuestion(), faq.getAnswer()))
                    .collect(Collectors.toList());

            return new FAQCategoryResponse(category, color, faqItems);
        }).collect(Collectors.toList());
    }

    // Get all FAQs (simple list)
    public List<Faq> getAllFAQs() {
        return faqRepository.findAll();
    }

    // Get FAQ by ID
    public Faq getFAQById(Integer id) {
        return faqRepository.findById(id).orElse(null);
    }

    // Create new FAQ
    public Faq createFAQ(FAQRequest faqRequest) {
        Faq faq = new Faq();
        faq.setQuestion(faqRequest.getQuestion());
        faq.setAnswer(faqRequest.getAnswer());
        faq.setCategory(faqRequest.getCategory());
        faq.setColor(faqRequest.getColor() != null ? faqRequest.getColor() : "bg-blue-500");

        return faqRepository.save(faq);
    }

    // Update FAQ
    public Faq updateFAQ(Integer id, FAQRequest faqRequest) {
        return faqRepository.findById(id).map(existingFAQ -> {
            existingFAQ.setQuestion(faqRequest.getQuestion());
            existingFAQ.setAnswer(faqRequest.getAnswer());
            existingFAQ.setCategory(faqRequest.getCategory());
            if (faqRequest.getColor() != null) {
                existingFAQ.setColor(faqRequest.getColor());
            }
            return faqRepository.save(existingFAQ);
        }).orElse(null);
    }

    // Delete FAQ
    public boolean deleteFAQ(Integer id) {
        if (faqRepository.existsById(id)) {
            faqRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Search FAQs
    public List<Faq> searchFAQs(String query) {
        return faqRepository.searchFAQs(query);
    }

    // Get all categories
    public List<String> getAllCategories() {
        return faqRepository.findDistinctCategories();
    }
}