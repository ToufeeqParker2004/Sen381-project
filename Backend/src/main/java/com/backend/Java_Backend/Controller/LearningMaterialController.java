package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.LearningMaterialDTO;
import com.backend.Java_Backend.DTO.TutorDetailsDTO;
import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Services.LearningMaterialService;
import com.backend.Java_Backend.Services.SupabaseStorageService;
import com.backend.Java_Backend.Services.TutorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/learning-materials")
public class LearningMaterialController {
    private static final Logger logger = LoggerFactory.getLogger(LearningMaterialController.class);

    private final LearningMaterialService learningMaterialService;
    private final TutorService tutorService;

    @Autowired
    private SupabaseStorageService storageService;

    @Autowired
    public LearningMaterialController(LearningMaterialService learningMaterialService, TutorService tutorService) {
        this.learningMaterialService = learningMaterialService;
        this.tutorService = tutorService;
    }

    // Get all learning materials as DTOs
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<LearningMaterialDTO>> getAllLearningMaterials() {
        logger.info("Handling GET /learning-materials request");
        List<LearningMaterialDTO> materials = learningMaterialService.getAllLearningMaterials();
        return ResponseEntity.ok(materials);
    }

    // Get a learning material by ID as DTO
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<LearningMaterialDTO> getLearningMaterialById(@PathVariable UUID id) {
        logger.debug("Handling GET /learning-materials/{}", id);
        Optional<LearningMaterialDTO> material = learningMaterialService.getMaterialById(id);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get a learning material by title as DTO
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/title/{title}")
    public ResponseEntity<LearningMaterialDTO> getLearningMaterialByTitle(@PathVariable String title) {
        logger.debug("Handling GET /learning-materials/title/{}", title);
        Optional<LearningMaterialDTO> material = learningMaterialService.getLearningMaterialbytitle(title);
        return material.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new learning material with file upload
    @PostMapping("/upload")
    public ResponseEntity<?> createLearningMaterialWithFile(
            @RequestParam("title") String title,
            @RequestParam("document_type") String documentType,
            @RequestParam(value = "topic_id", required = false) Integer topicId,
            @RequestParam(value = "module_id", required = false) Integer moduleId,
            @RequestParam(value = "tags", required = false) String tags, // Changed from String[] to String
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            logger.debug("Handling POST /learning-materials/upload with title: {}", title);
            if (file.isEmpty()) {
                logger.warn("File is empty in upload request");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "File cannot be empty"));
            }

            String principal = (String) authentication.getPrincipal();
            int studentId = Integer.parseInt(principal);
            logger.debug("Authenticated user student_id: {}", studentId);

            // ✅ FIX: Get existing tutor instead of trying to create new one
            TutorDetailsDTO tutorDetails = tutorService.getTutorDetailsByStudentId(studentId);
            if (tutorDetails == null) {
                logger.error("No tutor found for student_id: {}. User needs to have a tutor account.", studentId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("error", "Tutor account required to upload materials"));
            }
            int tutorId = tutorDetails.getId();
            logger.debug("Using existing tutor_id: {} for uploader_id", tutorId);

            String fileUrl = storageService.uploadFile(file);

            LearningMaterial material = new LearningMaterial();
            material.setTitle(title);
            material.setDocument_type(documentType);
            material.setTopic_id(topicId);
            material.setModule_id(moduleId);

            // Handle tags - convert String to String[] if needed
            if (tags != null && !tags.trim().isEmpty()) {
                material.setTags(new String[]{tags});
            }

            material.setUploader_id(tutorId);
            material.setFile_url(fileUrl);
            material.setCreated_at(Timestamp.from(Instant.now()));

            LearningMaterial savedMaterial = learningMaterialService.saveLearningMaterial(material);

            // Convert to DTO for response using the service method
            LearningMaterialDTO savedMaterialDTO = learningMaterialService.convertToDTO(savedMaterial);

            logger.debug("Successfully created LearningMaterial with ID: {}", savedMaterial.getId());
            return ResponseEntity.ok(savedMaterialDTO);

        } catch (Exception e) {
            logger.error("Error creating learning material: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to create learning material: " + e.getMessage()));
        }
    }

    // Update an existing learning material
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'LearningMaterial', 'own')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningMaterial(@PathVariable UUID id, @RequestBody LearningMaterial material, Authentication authentication) {
        logger.debug("Handling PUT /learning-materials/{}", id);
        Optional<LearningMaterial> existingMaterial = learningMaterialService.getMaterialEntityById(id);
        if (existingMaterial.isEmpty()) {
            logger.warn("Learning material not found for ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Learning material not found"));
        }
        String principal = (String) authentication.getPrincipal();
        int studentId = Integer.parseInt(principal);
        TutorDetailsDTO tutorDetails = tutorService.createTutor(studentId);
        if (tutorDetails == null) {
            logger.error("Failed to get or create Tutor for student_id: {}", studentId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to create tutor for uploader"));
        }
        int tutorId = tutorDetails.getId();
        logger.debug("Using tutor_id: {} for uploader_id in update", tutorId);

        LearningMaterial existing = existingMaterial.get();
        existing.setTopic_id(material.getTopic_id());
        existing.setModule_id(material.getModule_id());
        existing.setUploader_id(tutorId); // Use tutor_id
        existing.setTitle(material.getTitle());
        existing.setDocument_type(material.getDocument_type());
        existing.setFile_url(material.getFile_url());
        existing.setTags(material.getTags());
        existing.setCreated_at(Timestamp.from(Instant.now()));
        LearningMaterial updatedMaterial = learningMaterialService.saveLearningMaterial(existing);

        // Convert to DTO for response
        LearningMaterialDTO updatedMaterialDTO = new LearningMaterialDTO();
        updatedMaterialDTO.setId(updatedMaterial.getId());
        updatedMaterialDTO.setTopicId(updatedMaterial.getTopic_id());
        updatedMaterialDTO.setModuleId(updatedMaterial.getModule_id());
        updatedMaterialDTO.setUploaderId(updatedMaterial.getUploader_id());
        updatedMaterialDTO.setTitle(updatedMaterial.getTitle());
        updatedMaterialDTO.setDocumentType(updatedMaterial.getDocument_type());
        updatedMaterialDTO.setFileUrl(updatedMaterial.getFile_url());
        updatedMaterialDTO.setCreatedAt(updatedMaterial.getCreated_at());
        updatedMaterialDTO.setTags(updatedMaterial.getTags());
        updatedMaterialDTO.setUploaderDetails(tutorService.getTutorById(tutorId));

        logger.debug("Successfully updated LearningMaterial with ID: {}", updatedMaterial.getId());
        return ResponseEntity.ok(updatedMaterialDTO);
    }

    // Delete a learning material
    @PreAuthorize("hasRole('ADMIN') or hasPermission(#id, 'LearningMaterial', 'own')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningMaterial(@PathVariable UUID id) {
        logger.debug("Handling DELETE /learning-materials/{}", id);
        if (learningMaterialService.getMaterialEntityById(id).isPresent()) {
            learningMaterialService.deleteMaterial(id);
            logger.debug("Successfully deleted LearningMaterial with ID: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Learning material not found for ID: {}", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "Learning material not found"));
    }
}
