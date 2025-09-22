package com.backend.Java_Backend.Config;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.Modules;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentModule;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    private static final Logger logger = LoggerFactory.getLogger(ModelMapperConfig.class);

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);

        try {
            // Student to StudentDTO
            TypeMap<Student, StudentDTO> studentToDtoMap = modelMapper.createTypeMap(Student.class, StudentDTO.class);
            studentToDtoMap.addMappings(mapper -> {
                mapper.map(Student::getId, StudentDTO::setId);
                mapper.map(Student::getCreatedAt, StudentDTO::setCreatedAt);
                mapper.map(Student::getName, StudentDTO::setName);
                mapper.map(Student::getEmail, StudentDTO::setEmail);
                mapper.map(Student::getPhone_number, StudentDTO::setPhoneNumber);
                mapper.map(Student::getBio, StudentDTO::setBio);
            });

            // Student to StudentWithModulesDTO
            TypeMap<Student, StudentWithModuleDTO> studentToWithModulesMap = modelMapper.createTypeMap(Student.class, StudentWithModuleDTO.class);
            studentToWithModulesMap.addMappings(mapper -> {
                mapper.map(Student::getId, StudentWithModuleDTO::setId);
                mapper.map(Student::getCreatedAt, StudentWithModuleDTO::setCreatedAt);
                mapper.map(Student::getName, StudentWithModuleDTO::setName);
                mapper.map(Student::getEmail, StudentWithModuleDTO::setEmail);
                mapper.map(Student::getPhone_number, StudentWithModuleDTO::setPhoneNumber);
                mapper.map(Student::getBio, StudentWithModuleDTO::setBio);
                mapper.skip(StudentWithModuleDTO::setModules);
            });

            // CreateStudentDTO to Student
            TypeMap<CreateStudentDTO, Student> createStudentMap = modelMapper.createTypeMap(CreateStudentDTO.class, Student.class);
            createStudentMap.addMappings(mapper -> {
                mapper.map(CreateStudentDTO::getCreatedAt, Student::setCreatedAt);
                mapper.map(CreateStudentDTO::getName, Student::setName);
                mapper.map(CreateStudentDTO::getEmail, Student::setEmail);
                mapper.map(CreateStudentDTO::getPhoneNumber, Student::setPhone_number);
                mapper.map(CreateStudentDTO::getBio, Student::setBio);
                mapper.map(CreateStudentDTO::getPassword, Student::setPassword);
            });

            // UpdateStudentDTO to Student
            TypeMap<UpdateStudentDTO, Student> updateStudentMap = modelMapper.createTypeMap(UpdateStudentDTO.class, Student.class);
            updateStudentMap.addMappings(mapper -> {
                mapper.map(UpdateStudentDTO::getName, Student::setName);
                mapper.map(UpdateStudentDTO::getEmail, Student::setEmail);
                mapper.map(UpdateStudentDTO::getPhoneNumber, Student::setPhone_number);
                mapper.map(UpdateStudentDTO::getBio, Student::setBio);
            });

            // Modules to ModuleDTO
            TypeMap<Modules, ModuleDTO> moduleToDtoMap = modelMapper.createTypeMap(Modules.class, ModuleDTO.class);
            moduleToDtoMap.addMappings(mapper -> {
                mapper.map(Modules::getId, ModuleDTO::setId);
                mapper.map(Modules::getModule_code, ModuleDTO::setModule_code);
                mapper.map(Modules::getModule_name, ModuleDTO::setModule_name);
                mapper.map(Modules::getDescription, ModuleDTO::setDescription);
            });

            // Modules to ModuleWithStudentsDTO
            TypeMap<Modules, ModuleWithStudentsDTO> moduleToWithStudentsMap = modelMapper.createTypeMap(Modules.class, ModuleWithStudentsDTO.class);
            moduleToWithStudentsMap.addMappings(mapper -> {
                mapper.map(Modules::getId, ModuleWithStudentsDTO::setId);
                mapper.map(Modules::getModule_code, ModuleWithStudentsDTO::setModule_code);
                mapper.map(Modules::getModule_name, ModuleWithStudentsDTO::setModule_name);
                mapper.map(Modules::getDescription, ModuleWithStudentsDTO::setDescription);
                mapper.skip(ModuleWithStudentsDTO::setStudents);
            });

            // CreateModuleDTO to Modules
            TypeMap<CreateModuleDTO, Modules> createModuleMap = modelMapper.createTypeMap(CreateModuleDTO.class, Modules.class);
            createModuleMap.addMappings(mapper -> {
                mapper.map(CreateModuleDTO::getModuleCode, Modules::setModule_code);
                mapper.map(CreateModuleDTO::getModuleName, Modules::setModule_name);
                mapper.map(CreateModuleDTO::getDescription, Modules::setDescription);
            });

            // UpdateModuleDTO to Modules
            TypeMap<UpdateModuleDTO, Modules> updateModuleMap = modelMapper.createTypeMap(UpdateModuleDTO.class, Modules.class);
            updateModuleMap.addMappings(mapper -> {
                mapper.map(UpdateModuleDTO::getModuleCode, Modules::setModule_code);
                mapper.map(UpdateModuleDTO::getModuleName, Modules::setModule_name);
                mapper.map(UpdateModuleDTO::getDescription, Modules::setDescription);
            });

            // StudentModule to StudentModuleDTO
            TypeMap<StudentModule, StudentModuleDTO> studentModuleToDtoMap = modelMapper.createTypeMap(StudentModule.class, StudentModuleDTO.class);
            studentModuleToDtoMap.addMappings(mapper -> {
                mapper.map(src -> src.getStudent().getId(), StudentModuleDTO::setStudentId);
                mapper.map(src -> src.getModule().getId(), StudentModuleDTO::setModuleId);
                mapper.map(StudentModule::getEnrolledAt, StudentModuleDTO::setEnrolledAt);
            });

            // CreateStudentModuleDTO to StudentModule
            modelMapper.createTypeMap(CreateStudentModuleDTO.class, StudentModule.class);

            // UpdateStudentModuleDTO to StudentModule
            TypeMap<UpdateStudentModuleDTO, StudentModule> updateStudentModuleMap = modelMapper.createTypeMap(UpdateStudentModuleDTO.class, StudentModule.class);
            updateStudentModuleMap.addMappings(mapper -> {
                mapper.map(UpdateStudentModuleDTO::getEnrolledAt, StudentModule::setEnrolledAt);
            });

            logger.info("ModelMapper configured successfully with all mappings.");
        } catch (Exception e) {
            logger.error("Failed to configure ModelMapper: {}", e.getMessage(), e);
            throw new RuntimeException("ModelMapper configuration failed", e);
        }

        return modelMapper;
    }
}
