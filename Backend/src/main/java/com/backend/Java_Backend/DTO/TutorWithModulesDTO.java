package com.backend.Java_Backend.DTO;

import java.sql.Timestamp;
import java.util.List;

public class TutorWithModulesDTO {
    private TutorDTO tutor;
    private List<ModuleDTO> modules;

    public TutorWithModulesDTO(TutorDTO tutor, List<ModuleDTO> modules) {
        this.tutor = tutor;
        this.modules = modules;
    }

    // Getters and Setters
    public TutorDTO getTutor() { return tutor; }
    public void setTutor(TutorDTO tutor) { this.tutor = tutor; }
    public List<ModuleDTO> getModules() { return modules; }
    public void setModules(List<ModuleDTO> modules) { this.modules = modules; }
}
