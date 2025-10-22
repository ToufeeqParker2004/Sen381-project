package com.backend.Java_Backend.DTO;

public class FAQItem {
    private String question;
    private String answer;

    // Constructors
    public FAQItem() {}

    public FAQItem(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    // Getters and Setters
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}