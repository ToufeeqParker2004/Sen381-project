package com.backend.Java_Backend.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "tutor_modules")
public class TutorModule {

    @EmbeddedId
    private TutorModuleId id;

    @ManyToOne
    @MapsId("tutorId")
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    @ManyToOne
    @MapsId("moduleId")
    @JoinColumn(name = "module_id")
    private Modules module;

    public TutorModule() { }

    public TutorModule(Tutor tutor, Modules module) {
        this.tutor = tutor;
        this.module = module;
        this.id = new TutorModuleId(tutor.getId(), module.getId());
    }

    // Getters and setters
    public TutorModuleId getId() { return id; }
    public void setId(TutorModuleId id) { this.id = id; }

    public Tutor getTutor() { return tutor; }
    public void setTutor(Tutor tutor) { this.tutor = tutor; }

    public Modules getModule() { return module; }
    public void setModule(Modules module) { this.module = module; }
}

