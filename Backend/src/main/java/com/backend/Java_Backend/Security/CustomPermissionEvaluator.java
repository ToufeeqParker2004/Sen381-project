package com.backend.Java_Backend.Security;

import com.backend.Java_Backend.Models.ForumPost;
import com.backend.Java_Backend.Models.LearningMaterial;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.ForumPostRepository;
import com.backend.Java_Backend.Repository.LearningMatRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {
    private static final Logger LOGGER = Logger.getLogger(CustomPermissionEvaluator.class.getName());

    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private ForumPostRepository forumPostRepository;
    @Autowired
    private LearningMatRepository learningMaterialRepository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        return false; // Not used
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (!"own".equals(permission)) {
            LOGGER.warning("Invalid permission type: " + permission);
            return false;
        }
        // Allow admins to bypass
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            LOGGER.info("Admin access granted for targetType: " + targetType + ", targetId: " + targetId);
            return true;
        }
        String principal = (String) authentication.getPrincipal();
        try {
            int userId = Integer.parseInt(principal); // Student or tutor ID
            LOGGER.info("Checking permission for userId: " + userId + ", targetType: " + targetType + ", targetId: " + targetId);
            if ("Tutor".equals(targetType)) {
                Optional<Tutor> tutorOpt = tutorRepository.findById((Integer) targetId);
                if (tutorOpt.isPresent()) {
                    Integer studentId = tutorOpt.get().getStudent_id();
                    boolean hasPermission = studentId != null && studentId == userId;
                    LOGGER.info("Tutor permission check: studentId=" + studentId + ", userId=" + userId + ", result=" + hasPermission);
                    return hasPermission;
                }
                LOGGER.warning("Tutor not found for tutorId: " + targetId);
                return false;
            }
            if ("ForumPost".equals(targetType)) {
                Optional<ForumPost> postOpt = forumPostRepository.findById((UUID) targetId);
                if (postOpt.isPresent()) {
                    boolean hasPermission = postOpt.get().getAuthorId() == userId;
                    LOGGER.info("ForumPost permission check: authorId=" + postOpt.get().getAuthorId() + ", userId=" + userId + ", result=" + hasPermission);
                    return hasPermission;
                }
                LOGGER.warning("ForumPost not found for postId: " + targetId);
                return false;
            }
            if ("LearningMaterial".equals(targetType)) {
                Optional<LearningMaterial> materialOpt = learningMaterialRepository.findById((UUID) targetId);
                if (materialOpt.isPresent()) {
                    boolean hasPermission = materialOpt.get().getUploader_id() == userId;
                    LOGGER.info("LearningMaterial permission check: uploaderId=" + materialOpt.get().getUploader_id() + ", userId=" + userId + ", result=" + hasPermission);
                    return hasPermission;
                }
                LOGGER.warning("LearningMaterial not found for materialId: " + targetId);
                return false;
            }
            if ("StudentModule".equals(targetType)) {
                if (!(targetId instanceof Integer)) {
                    LOGGER.warning("StudentModule targetId is not an Integer: " + targetId);
                    return false;
                }
                Integer studentId = (Integer) targetId;
                boolean hasPermission = studentId != null && studentId == userId;
                LOGGER.info("StudentModule permission check: studentId=" + studentId + ", userId=" + userId + ", result=" + hasPermission);
                return hasPermission;
            }
            LOGGER.warning("Unknown targetType: " + targetType);
            return false;
        } catch (NumberFormatException e) {
            LOGGER.warning("Invalid principal format: " + principal + ", error: " + e.getMessage());
            return false; // Admin UUID fails parsing, deny unless ROLE_ADMIN
        }
    }
}
