package com.backend.Java_Backend.DTO;

import java.util.List;

public class TutorWithModulesDTO {
    private TutorDetailsDTO tutor;
    private List<ModuleDTO> modules;

    public TutorWithModulesDTO(TutorDetailsDTO tutor, List<ModuleDTO> modules) {
        this.tutor = tutor;
        this.modules = modules;
    }

    public TutorDetailsDTO getTutor() {
        return tutor;
    }

    public void setTutor(TutorDetailsDTO tutor) {
        this.tutor = tutor;
    }

    public List<ModuleDTO> getModules() {
        return modules;
    }

    public void setModules(List<ModuleDTO> modules) {
        this.modules = modules;
    }
}
