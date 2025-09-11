package com.backend.Java_Backend.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorModuleId implements Serializable {
    @Column(name = "tutor_id")
    private int tutorId;
    @Column(name = "module_id")
    private int moduleId;

    public TutorModuleId() { }

    public TutorModuleId(int tutorId, int moduleId) {
        this.tutorId = tutorId;
        this.moduleId = moduleId;
    }

    // Getters and setters
    public int getTutorId() { return tutorId; }
    public void setTutorId(int tutorId) { this.tutorId = tutorId; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TutorModuleId)) return false;
        TutorModuleId that = (TutorModuleId) o;
        return tutorId == that.tutorId && moduleId == that.moduleId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(tutorId, moduleId);
    }
}

