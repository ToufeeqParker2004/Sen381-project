package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "resources")
public class Resources {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    @Column(name = "student_id")
    int studentId;
    UUID Learning_MaterialsID;
    @Column(name = "tutor_id")
    int tutorID;

    public Resources() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public UUID getLearning_MaterialsID() {
        return Learning_MaterialsID;
    }

    public void setLearning_MaterialsID(UUID learning_MaterialsID) {
        Learning_MaterialsID = learning_MaterialsID;
    }

    public int getTutorID() {
        return tutorID;
    }

    public void setTutorID(int tutorID) {
        this.tutorID = tutorID;
    }
}
