// DTOs (continued)
package com.backend.Java_Backend.DTO;

public class CreateModuleDTO {
    private String moduleCode;
    private String moduleName;
    private String description;

    // Constructors
    public CreateModuleDTO() {}

    public CreateModuleDTO(String moduleCode, String moduleName, String description) {
        this.moduleCode = moduleCode;
        this.moduleName = moduleName;
        this.description = description;
    }

    // Getters and Setters
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }

    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
