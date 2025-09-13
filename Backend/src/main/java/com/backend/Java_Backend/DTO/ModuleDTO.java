package com.backend.Java_Backend.DTO;

public class ModuleDTO {
    int id;
    String module_code;
    String module_name;
    String description;

    public ModuleDTO(int id, String module_code, String module_name, String description) {
        this.id = id;
        this.module_code = module_code;
        this.module_name = module_name;
        this.description = description;
    }

    public ModuleDTO() {

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

    public String getModule_name() {
        return module_name;
    }

    public void setModule_name(String module_name) {
        this.module_name = module_name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
