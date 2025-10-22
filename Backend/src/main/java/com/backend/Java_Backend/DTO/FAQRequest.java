package com.backend.Java_Backend.DTO;

public class FAQRequest {
    private String question;
    private String answer;
    private String category;
    private String color;

    // Constructors
    public FAQRequest() {}

    public FAQRequest(String question, String answer, String category, String color) {
        this.question = question;
        this.answer = answer;
        this.category = category;
        this.color = color;
    }

    // Getters and Setters
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}