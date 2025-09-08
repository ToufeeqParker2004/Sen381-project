package com.backend.Java_Backend.Models;

public class TutorModule {
    int tutor_id;
    int module_id;

    public TutorModule(int tutor_id, int module_id) {
        this.tutor_id = tutor_id;
        this.module_id = module_id;
    }

    public int getTutor_id() {
        return tutor_id;
    }

    public void setTutor_id(int tutor_id) {
        this.tutor_id = tutor_id;
    }

    public int getModule_id() {
        return module_id;
    }

    public void setModule_id(int module_id) {
        this.module_id = module_id;
    }
}
