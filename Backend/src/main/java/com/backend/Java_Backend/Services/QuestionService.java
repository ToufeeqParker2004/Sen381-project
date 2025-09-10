package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Question;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.QuestionRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Get all Question
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get a Question by ID
    public Optional<Question> getQuestionById(UUID id) {
        return questionRepository.findById(id);
    }

    // Save or update a Question
    public Question saveStudent(Question question) {
        return questionRepository.save(question);
    }

    // Delete a Question by ID
    public void deleteStudent(UUID id) {
        questionRepository.deleteById(id);
    }


}
