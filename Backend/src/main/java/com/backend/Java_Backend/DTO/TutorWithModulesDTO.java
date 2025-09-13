package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class TutorWithModulesDTO {
    int id;
    Timestamp created_at;
    int student_id;
    List<ModuleDTO> modules;

    public TutorWithModulesDTO(int id, Timestamp created_at, int student_id, List<ModuleDTO> modules) {
        this.id = id;
        this.created_at = created_at;
        this.student_id = student_id;
        this.modules = modules;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public List<ModuleDTO> getModules() {
        return modules;
    }

    public void setModules(List<ModuleDTO> modules) {
        this.modules = modules;
    }
}
