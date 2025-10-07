package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Models.Resources;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.LearningMatRepository;
import com.backend.Java_Backend.Repository.ResourcesRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResourcesService {

    @Autowired
    private ResourcesRepository resourcesRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private LearningMatRepository learningMaterialRepository;

    public ReadResourcesDTO createResource(CreateResourcesDTO dto) {
        Resources resource = new Resources();
        resource.setStudentId(dto.getStudentId());
        resource.setLearning_MaterialsID(dto.getLearningMaterialsId());
        resource.setTutorID(dto.getTutorId());
        Resources saved = resourcesRepository.save(resource);
        return convertToReadDTO(saved);
    }

    public Optional<ReadResourcesDTO> getResourceById(int id) {
        return resourcesRepository.findById(id).map(this::convertToReadDTO);
    }

    public Optional<ReadResourcesDTO> updateResource(int id, UpdateResourcesDTO dto) {
        return resourcesRepository.findById(id).map(resource -> {
            resource.setStudentId(dto.getStudentId());
            resource.setLearning_MaterialsID(dto.getLearningMaterialsId());
            resource.setTutorID(dto.getTutorId());
            Resources updated = resourcesRepository.save(resource);
            return convertToReadDTO(updated);
        });
    }

    public void deleteResource(int id) {
        resourcesRepository.deleteById(id);
    }

    public StudentSearchResponse searchByStudentId(int studentId) {
        List<Resources> resources = resourcesRepository.findByStudentId(studentId);
        List<ResourceMatchForStudentDTO> matches = new ArrayList<>();
        for (Resources res : resources) {
            ResourceMatchForStudentDTO match = new ResourceMatchForStudentDTO();
            match.setResourceId(res.getId());
            tutorRepository.findById(res.getTutorID()).ifPresent(tutor -> match.setTutor(convertToTutorDTO(tutor)));
            learningMaterialRepository.findById(res.getLearning_MaterialsID()).ifPresent(lm -> match.setLearningMaterial(convertToLearningMaterialDTO(lm)));
            matches.add(match);
        }
        StudentSearchResponse response = new StudentSearchResponse();
        response.setStudentId(studentId);
        response.setMatches(matches);
        return response;
    }

    public TutorSearchResponse searchByTutorId(int tutorId) {
        List<Resources> resources = resourcesRepository.findByTutorID(tutorId);
        List<ResourceMatchForTutorDTO> matches = new ArrayList<>();
        for (Resources res : resources) {
            ResourceMatchForTutorDTO match = new ResourceMatchForTutorDTO();
            match.setResourceId(res.getId());
            studentRepository.findById(res.getStudentId()).ifPresent(student -> match.setStudent(convertToStudentDTO(student)));
            learningMaterialRepository.findById(res.getLearning_MaterialsID()).ifPresent(lm -> match.setLearningMaterial(convertToLearningMaterialDTO(lm)));
            matches.add(match);
        }
        TutorSearchResponse response = new TutorSearchResponse();
        response.setTutorId(tutorId);
        response.setMatches(matches);
        return response;
    }

    public LearningMaterialSearchResponse searchByLearningMaterialId(UUID materialId) {
        List<Resources> resources = resourcesRepository.findByLearning_MaterialsID(materialId);
        List<ResourceMatchForLearningMaterialDTO> matches = new ArrayList<>();
        for (Resources res : resources) {
            ResourceMatchForLearningMaterialDTO match = new ResourceMatchForLearningMaterialDTO();
            match.setResourceId(res.getId());
            studentRepository.findById(res.getStudentId()).ifPresent(student -> match.setStudent(convertToStudentDTO(student)));
            tutorRepository.findById(res.getTutorID()).ifPresent(tutor -> match.setTutor(convertToTutorDTO(tutor)));
            matches.add(match);
        }
        LearningMaterialSearchResponse response = new LearningMaterialSearchResponse();
        response.setLearningMaterialId(materialId);
        response.setMatches(matches);
        return response;
    }

    private ReadResourcesDTO convertToReadDTO(Resources resource) {
        ReadResourcesDTO dto = new ReadResourcesDTO();
        dto.setId(resource.getId());
        studentRepository.findById(resource.getStudentId()).ifPresent(student -> dto.setStudent(convertToStudentDTO(student)));
        tutorRepository.findById(resource.getTutorID()).ifPresent(tutor -> dto.setTutor(convertToTutorDTO(tutor)));
        learningMaterialRepository.findById(resource.getLearning_MaterialsID()).ifPresent(lm -> dto.setLearningMaterial(convertToLearningMaterialDTO(lm)));
        return dto;
    }

    private StudentDTO convertToStudentDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setBio(student.getBio());
        dto.setLocation(student.getLocation());
        return dto;
    }

    private TutorDTO convertToTutorDTO(Tutor tutor) {
        TutorDTO dto = new TutorDTO();
        dto.setId(tutor.getId());
        dto.setCreated_at(tutor.getCreated_at());
        dto.setStudentId(tutor.getStudent_id());
        return dto;
    }

    private LearningMaterialDTO convertToLearningMaterialDTO(LearningMaterial lm) {
        LearningMaterialDTO dto = new LearningMaterialDTO();
        dto.setId(lm.getId());
        dto.setTopicId(lm.getTopic_id());
        dto.setModuleId(lm.getModule_id());
        dto.setUploaderId(lm.getUploader_id());
        dto.setTitle(lm.getTitle());
        dto.setDocumentType(lm.getDocument_type());
        dto.setFileUrl(lm.getFile_url());
        dto.setCreatedAt(lm.getCreated_at());
        dto.setTags(lm.getTags());
        return dto;
    }
}
