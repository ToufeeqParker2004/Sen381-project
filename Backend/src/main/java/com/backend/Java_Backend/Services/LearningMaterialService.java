package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.LearningMaterialDTO;
import com.backend.Java_Backend.DTO.TutorDetailsDTO;
import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Repository.LearningMatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LearningMaterialService {
    private static final Logger logger = LoggerFactory.getLogger(LearningMaterialService.class);

    private final LearningMatRepository learningMatRepository;
    private final TutorService tutorService;

    @Autowired
    public LearningMaterialService(LearningMatRepository learningMatRepository, TutorService tutorService) {
        this.learningMatRepository = learningMatRepository;
        this.tutorService = tutorService;
    }

    // Helper method to convert LearningMaterial to DTO with tutor details
    private LearningMaterialDTO convertToDTO(LearningMaterial material) {
        logger.debug("Converting LearningMaterial ID: {}, uploader_id: {}", material.getId(), material.getUploader_id());

        LearningMaterialDTO dto = new LearningMaterialDTO();
        dto.setId(material.getId());
        dto.setTopicId(material.getTopic_id());
        dto.setModuleId(material.getModule_id());
        dto.setUploaderId(material.getUploader_id());
        dto.setTitle(material.getTitle());
        dto.setDocumentType(material.getDocument_type());
        dto.setFileUrl(material.getFile_url());
        dto.setCreatedAt(material.getCreated_at());
        dto.setTags(material.getTags());

        // Fetch and set tutor details if uploader_id exists
        if (material.getUploader_id() != null) {
            try {
                TutorDetailsDTO tutorDetails = tutorService.getTutorById(material.getUploader_id());
                if (tutorDetails == null) {
                    logger.warn("TutorDetailsDTO is null for uploader_id (tutor_id): {}. Verify Tutor data.", material.getUploader_id());
                } else {
                    logger.debug("Successfully fetched TutorDetailsDTO for uploader_id (tutor_id): {} - Name: {}",
                            material.getUploader_id(), tutorDetails.getName());
                }
                dto.setUploaderDetails(tutorDetails);
            } catch (Exception e) {
                logger.error("Error fetching TutorDetailsDTO for uploader_id (tutor_id): {}: {}",
                        material.getUploader_id(), e.getMessage(), e);
                dto.setUploaderDetails(null);
            }
        } else {
            logger.warn("uploader_id is null for LearningMaterial ID: {}. Skipping tutor details.", material.getId());
            dto.setUploaderDetails(null);
        }

        return dto;
    }

    // Get all Learning Materials as DTOs
    public List<LearningMaterialDTO> getAllLearningMaterials() {
        logger.info("Fetching all learning materials");
        List<LearningMaterialDTO> materials = learningMatRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        logger.info("Returning {} learning materials", materials.size());
        return materials;
    }

    // Get a learning Material by ID as DTO
    public Optional<LearningMaterialDTO> getMaterialById(UUID id) {
        logger.debug("Fetching LearningMaterial by ID: {}", id);
        return learningMatRepository.findById(id).map(this::convertToDTO);
    }

    // Get a learning Material by ID as Entity (for internal use)
    public Optional<LearningMaterial> getMaterialEntityById(UUID id) {
        logger.debug("Fetching LearningMaterial entity by ID: {}", id);
        return learningMatRepository.findById(id);
    }

    // Save or update a Learning Material
    public LearningMaterial saveLearningMaterial(LearningMaterial material) {
        logger.debug("Saving LearningMaterial with ID: {} and uploader_id: {}", material.getId(), material.getUploader_id());
        return learningMatRepository.save(material);
    }

    // Delete a Learning Material by ID
    public void deleteMaterial(UUID id) {
        logger.debug("Deleting LearningMaterial with ID: {}", id);
        learningMatRepository.deleteById(id);
    }

    // Find by title as DTO
    public Optional<LearningMaterialDTO> getLearningMaterialbytitle(String title) {
        logger.debug("Fetching LearningMaterial by title: {}", title);
        return learningMatRepository.findByTitle(title).map(this::convertToDTO);
    }
}
