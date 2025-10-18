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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResourcesService {
    private static final Logger logger = LoggerFactory.getLogger(ResourcesService.class);

    @Autowired
    private ResourcesRepository resourcesRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private LearningMatRepository learningMaterialRepository;

    @Autowired
    private TutorService tutorService;

    @Transactional
    public ReadResourcesDTO createResource(CreateResourcesDTO dto) {
        logger.debug("Creating resource with studentId: {}, tutorId: {}, learningMaterialsId: {}",
                dto.getStudentId(), dto.getTutorId(), dto.getLearningMaterialsId());
        if (!tutorRepository.existsById(dto.getTutorId())) {
            logger.warn("Invalid tutorId: {}", dto.getTutorId());
            throw new IllegalArgumentException("Invalid tutorId: " + dto.getTutorId());
        }
        if (!studentRepository.existsById(dto.getStudentId())) {
            logger.warn("Invalid studentId: {}", dto.getStudentId());
            throw new IllegalArgumentException("Invalid studentId: " + dto.getStudentId());
        }
        if (!learningMaterialRepository.existsById(dto.getLearningMaterialsId())) {
            logger.warn("Invalid learningMaterialsId: {}", dto.getLearningMaterialsId());
            throw new IllegalArgumentException("Invalid learningMaterialsId: " + dto.getLearningMaterialsId());
        }
        Resources resource = new Resources();
        resource.setStudentId(dto.getStudentId());
        resource.setLearning_MaterialsID(dto.getLearningMaterialsId());
        resource.setTutorID(dto.getTutorId());
        Resources saved = resourcesRepository.save(resource);
        return convertToReadDTO(saved);
    }

    @Transactional(readOnly = true)
    public Optional<ReadResourcesDTO> getResourceById(int id) {
        logger.debug("Fetching resource by ID: {}", id);
        return resourcesRepository.findById(id).map(this::convertToReadDTO);
    }

    @Transactional
    public Optional<ReadResourcesDTO> updateResource(int id, UpdateResourcesDTO dto) {
        logger.debug("Updating resource with ID: {}", id);
        return resourcesRepository.findById(id).map(resource -> {
            resource.setStudentId(dto.getStudentId());
            resource.setLearning_MaterialsID(dto.getLearningMaterialsId());
            resource.setTutorID(dto.getTutorId());
            Resources updated = resourcesRepository.save(resource);
            return convertToReadDTO(updated);
        });
    }

    @Transactional
    public void deleteResource(int id) {
        logger.debug("Deleting resource with ID: {}", id);
        resourcesRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public StudentSearchResponse searchByStudentId(int studentId) {
        logger.debug("Searching resources by student ID: {}", studentId);
        List<Resources> resources = resourcesRepository.findByStudentId(studentId);
        List<ResourceMatchForStudentDTO> matches = new ArrayList<>();
        for (Resources res : resources) {
            ResourceMatchForStudentDTO match = new ResourceMatchForStudentDTO();
            match.setResourceId(res.getId());
            match.setTutor(tutorService.getTutorById(res.getTutorID()));
            learningMaterialRepository.findById(res.getLearning_MaterialsID()).ifPresent(lm -> match.setLearningMaterial(convertToLearningMaterialDTO(lm)));
            matches.add(match);
        }
        StudentSearchResponse response = new StudentSearchResponse();
        response.setStudentId(studentId);
        response.setMatches(matches);
        logger.debug("Found {} resources for student ID: {}", matches.size(), studentId);
        return response;
    }

    @Transactional(readOnly = true)
    public TutorSearchResponse searchByTutorId(int tutorId) {
        logger.debug("Searching resources by tutor ID: {}", tutorId);
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
        logger.debug("Found {} resources for tutor ID: {}", matches.size(), tutorId);
        return response;
    }

    @Transactional(readOnly = true)
    public LearningMaterialSearchResponse searchByLearningMaterialId(UUID materialId) {
        logger.debug("Searching resources by learning material ID: {}", materialId);
        List<Resources> resources = resourcesRepository.findByLearning_MaterialsID(materialId);
        List<ResourceMatchForLearningMaterialDTO> matches = new ArrayList<>();
        for (Resources res : resources) {
            ResourceMatchForLearningMaterialDTO match = new ResourceMatchForLearningMaterialDTO();
            match.setResourceId(res.getId());
            studentRepository.findById(res.getStudentId()).ifPresent(student -> match.setStudent(convertToStudentDTO(student)));
            match.setTutor(tutorService.getTutorById(res.getTutorID()));
            matches.add(match);
        }
        LearningMaterialSearchResponse response = new LearningMaterialSearchResponse();
        response.setLearningMaterialId(materialId);
        response.setMatches(matches);
        logger.debug("Found {} resources for learning material ID: {}", matches.size(), materialId);
        return response;
    }

    private ReadResourcesDTO convertToReadDTO(Resources resource) {
        ReadResourcesDTO dto = new ReadResourcesDTO();
        dto.setId(resource.getId());
        studentRepository.findById(resource.getStudentId()).ifPresent(student -> dto.setStudent(convertToStudentDTO(student)));
        TutorDetailsDTO tutorDetails = tutorService.getTutorById(resource.getTutorID());
        logger.debug("Fetched tutorDetails for tutorID: {} - Name: {}, Email: {}, ModuleIds: {}",
                resource.getTutorID(),
                tutorDetails != null ? tutorDetails.getName() : "null",
                tutorDetails != null ? tutorDetails.getEmail() : "null",
                tutorDetails != null ? tutorDetails.getModuleIds() : "null");
        dto.setTutor(tutorDetails);
        learningMaterialRepository.findById(resource.getLearning_MaterialsID()).ifPresent(lm -> dto.setLearningMaterial(convertToLearningMaterialDTO(lm)));
        logger.debug("Converted Resource to DTO: ID={}, StudentId={}, TutorId={}, LearningMaterialId={}",
                dto.getId(), resource.getStudentId(), resource.getTutorID(), resource.getLearning_MaterialsID());
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
        logger.debug("Converted Student to DTO: ID={}, Email={}", dto.getId(), dto.getEmail());
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
        if (lm.getUploader_id() != null) {
            TutorDetailsDTO tutorDetails = tutorService.getTutorById(lm.getUploader_id());
            logger.debug("Fetched uploaderDetails for uploader_id: {} - Name: {}, Email: {}, ModuleIds: {}",
                    lm.getUploader_id(),
                    tutorDetails != null ? tutorDetails.getName() : "null",
                    tutorDetails != null ? tutorDetails.getEmail() : "null",
                    tutorDetails != null ? tutorDetails.getModuleIds() : "null");
            dto.setUploaderDetails(tutorDetails);
        } else {
            logger.warn("uploader_id is null for LearningMaterial ID: {}", lm.getId());
        }
        return dto;
    }
}