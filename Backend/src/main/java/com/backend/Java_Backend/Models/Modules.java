package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name= "modules")
public class Modules {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment for Postgres/MySQL
    int id;
    String module_code;
    String description;
    @OneToMany(mappedBy = "module")
    private List<StudentModule> studentModules;
    @OneToMany(mappedBy = "module")
    private List<TutorModule> tutorModules;
    public Modules(String module_code, String description) {

        this.module_code = module_code;
        this.description = description;
    }

    public int getId() {
        return id;
    }



    public String getModule_code() {
        return module_code;
    }

    public void setModule_code(String module_code) {
        this.module_code = module_code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public List<StudentModule> getStudentModules() { return studentModules; }
    public void setStudentModules(List<StudentModule> studentModules) { this.studentModules = studentModules; }
    public List<TutorModule> getTutorModules() { return tutorModules; }
    public void setTutorModules(List<TutorModule> tutorModules) { this.tutorModules = tutorModules; }
}

