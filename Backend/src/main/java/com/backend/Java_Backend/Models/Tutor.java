package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "tutors")
public class Tutor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    Timestamp created_at;
    int student_id;

    @OneToMany(mappedBy = "tutor")
    private List<TutorModule> tutorModules;
    public Tutor() {
    }

    public Tutor( Timestamp created_at, int student_id) {

        this.created_at = created_at;
        this.student_id = student_id;
    }

    public int getId() {
        return id;
    }


    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public int getStudent_id() {
        return student_id;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }
    public List<TutorModule> getTutorModules() { return tutorModules; }
    public void setTutorModules(List<TutorModule> tutorModules) { this.tutorModules = tutorModules; }
}
