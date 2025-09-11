package com.backend.Java_Backend.Models;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentModuleId implements Serializable {

    private int studentId;
    private int moduleId;

    public StudentModuleId() { }

    public StudentModuleId(int studentId, int moduleId) {
        this.studentId = studentId;
        this.moduleId = moduleId;
    }

    // Getters and setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getModuleId() { return moduleId; }
    public void setModuleId(int moduleId) { this.moduleId = moduleId; }

    // hashCode and equals
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentModuleId)) return false;
        StudentModuleId that = (StudentModuleId) o;
        return studentId == that.studentId && moduleId == that.moduleId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, moduleId);
    }
}


