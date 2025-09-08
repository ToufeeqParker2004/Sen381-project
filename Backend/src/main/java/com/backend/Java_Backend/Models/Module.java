package com.backend.Java_Backend.Models;

public class Module {
    int id;
    String module_code;
    String description;

    public Module(int id, String module_code, String description) {
        this.id = id;
        this.module_code = module_code;
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
}
