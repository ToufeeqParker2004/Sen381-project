package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FAQRepository extends JpaRepository<Faq, Integer> {

    // Find all FAQs by category
    List<Faq> findByCategory(String category);

    // Find all distinct categories
    @Query("SELECT DISTINCT f.category FROM Faq f ORDER BY f.category")
    List<String> findDistinctCategories();

    // Search FAQs by question or answer
    @Query("SELECT f FROM Faq f WHERE LOWER(f.question) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.answer) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faq> searchFAQs(String query);
}