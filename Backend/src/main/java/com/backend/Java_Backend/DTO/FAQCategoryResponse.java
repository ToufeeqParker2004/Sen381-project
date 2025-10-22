package com.backend.Java_Backend.DTO;

import java.util.List;

public class FAQCategoryResponse {
    private String category;
    private String color;
    private List<FAQItem> faqs;

    // Constructors
    public FAQCategoryResponse() {}

    public FAQCategoryResponse(String category, String color, List<FAQItem> faqs) {
        this.category = category;
        this.color = color;
        this.faqs = faqs;
    }

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public List<FAQItem> getFaqs() { return faqs; }
    public void setFaqs(List<FAQItem> faqs) { this.faqs = faqs; }
}