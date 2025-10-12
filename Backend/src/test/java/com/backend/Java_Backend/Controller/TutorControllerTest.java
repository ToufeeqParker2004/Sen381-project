// TutorControllerTest.java
package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.*;
import com.backend.Java_Backend.Services.TutorModuleService;
import com.backend.Java_Backend.Services.TutorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorControllerTest {

    @Mock
    private TutorService tutorService;

    @Mock
    private TutorModuleService tutorModuleService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TutorController tutorController;

    private TutorDTO testTutorDTO;
    private TutorModuleDTO testTutorModuleDTO;
    private TutorWithModulesDTO testTutorWithModulesDTO;
    private updateTutorDTO testUpdateTutorDTO;
    private ModuleDTO testModuleDTO;

    @BeforeEach
    void setUp() {
        // Create test objects using the actual DTO constructors
        testTutorDTO = new TutorDTO(1, 100, Timestamp.from(Instant.now()), "john.doe@belgiumcampus.ac.za", Arrays.asList(1, 2));

        testTutorModuleDTO = new TutorModuleDTO(1, 1);

        // Use the actual ModuleDTO constructor with 4 parameters
        testModuleDTO = new ModuleDTO(1, "CS101", "Java Programming", "Introduction to Java programming language");

        testTutorWithModulesDTO = new TutorWithModulesDTO(testTutorDTO, Arrays.asList(testModuleDTO));

        testUpdateTutorDTO = new updateTutorDTO();
        testUpdateTutorDTO.setCreated_at(Timestamp.from(Instant.now()));
    }

    // WB-TUT-01: Test getAllTutors - successful retrieval
    @Test
    void getAllTutors_ShouldReturnListOfTutors() {
        // Arrange
        List<TutorDTO> tutors = Arrays.asList(testTutorDTO);
        when(tutorService.getAllTutors()).thenReturn(tutors);

        // Act
        ResponseEntity<?> response = tutorController.getAllTutors();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<TutorDTO> responseBody = (List<TutorDTO>) response.getBody();
        assertEquals(1, responseBody.size());
        assertEquals(1, responseBody.get(0).getId());
        verify(tutorService).getAllTutors();
    }

    // WB-TUT-02: Test getTutorById - tutor exists
    @Test
    void getTutorById_WhenTutorExists_ShouldReturnTutor() {
        // Arrange
        when(tutorService.getTutorById(1)).thenReturn(testTutorDTO);

        // Act
        ResponseEntity<?> response = tutorController.getTutorById(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorDTO);
        TutorDTO responseBody = (TutorDTO) response.getBody();
        assertEquals(1, responseBody.getId());
        assertEquals(100, responseBody.getStudentId());
        verify(tutorService).getTutorById(1);
    }

    // WB-TUT-03: Test getTutorById - tutor not found
    @Test
    void getTutorById_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorService.getTutorById(999)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.getTutorById(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found", body.get("error"));
        verify(tutorService).getTutorById(999);
    }

    // WB-TUT-04: Test getTutorByStudentId - tutor exists
    @Test
    void getTutorByStudentId_WhenTutorExists_ShouldReturnTutor() {
        // Arrange
        when(tutorService.getTutorByStudentId(100)).thenReturn(testTutorDTO);

        // Act
        ResponseEntity<?> response = tutorController.getTutorByStudentId(100);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorDTO);
        TutorDTO responseBody = (TutorDTO) response.getBody();
        assertEquals(100, responseBody.getStudentId());
        verify(tutorService).getTutorByStudentId(100);
    }

    // WB-TUT-05: Test getTutorByStudentId - tutor not found
    @Test
    void getTutorByStudentId_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorService.getTutorByStudentId(999)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.getTutorByStudentId(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found for student ID: 999", body.get("error"));
        verify(tutorService).getTutorByStudentId(999);
    }

    // WB-TUT-06: Test createTutor - successful creation
    @Test
    void createTutor_WithValidStudentId_ShouldCreateTutor() {
        // Arrange
        when(tutorService.createTutor(100)).thenReturn(testTutorDTO);

        // Act
        ResponseEntity<?> response = tutorController.createTutor(100);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorDTO);
        verify(tutorService).createTutor(100);
    }

    // WB-TUT-07: Test createTutor - invalid student ID or duplicate
    @Test
    void createTutor_WithInvalidStudentId_ShouldReturnBadRequest() {
        // Arrange
        when(tutorService.createTutor(999)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.createTutor(999);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Invalid student ID or tutor already exists", body.get("error"));
        verify(tutorService).createTutor(999);
    }

    // WB-TUT-08: Test updateTutor - successful update
    @Test
    void updateTutor_WhenTutorExists_ShouldUpdateTutor() {
        // Arrange
        when(tutorService.updateTutor(1, testUpdateTutorDTO)).thenReturn(testTutorDTO);

        // Act
        ResponseEntity<?> response = tutorController.updateTutor(1, testUpdateTutorDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorDTO);
        verify(tutorService).updateTutor(1, testUpdateTutorDTO);
    }

    // WB-TUT-09: Test updateTutor - tutor not found
    @Test
    void updateTutor_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorService.updateTutor(999, testUpdateTutorDTO)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.updateTutor(999, testUpdateTutorDTO);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found", body.get("error"));
        verify(tutorService).updateTutor(999, testUpdateTutorDTO);
    }

    // WB-TUT-10: Test deleteTutor - successful deletion
    @Test
    void deleteTutor_WhenTutorExists_ShouldReturnNoContent() {
        // Arrange
        when(tutorService.deleteTutor(1)).thenReturn(true);

        // Act
        ResponseEntity<?> response = tutorController.deleteTutor(1);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(tutorService).deleteTutor(1);
    }

    // WB-TUT-11: Test deleteTutor - tutor not found
    @Test
    void deleteTutor_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorService.deleteTutor(999)).thenReturn(false);

        // Act
        ResponseEntity<?> response = tutorController.deleteTutor(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found", body.get("error"));
        verify(tutorService).deleteTutor(999);
    }

    // WB-TUT-12: Test getProfile - successful retrieval
    @Test
    void getProfile_WithValidAuthentication_ShouldReturnTutorProfile() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("100");
        when(tutorService.getTutorByStudentId(100)).thenReturn(testTutorDTO);

        // Act
        ResponseEntity<?> response = tutorController.getProfile(authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorDTO);
        TutorDTO responseBody = (TutorDTO) response.getBody();
        assertEquals(100, responseBody.getStudentId());
        verify(tutorService).getTutorByStudentId(100);
    }

    // WB-TUT-13: Test getProfile - invalid principal format
    @Test
    void getProfile_WithInvalidPrincipal_ShouldReturnBadRequest() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("invalid");

        // Act
        ResponseEntity<?> response = tutorController.getProfile(authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Invalid ID format", body.get("error"));
        verify(tutorService, never()).getTutorByStudentId(anyInt());
    }

    // WB-TUT-14: Test getProfile - tutor not found
    @Test
    void getProfile_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(authentication.getPrincipal()).thenReturn("100");
        when(tutorService.getTutorByStudentId(100)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.getProfile(authentication);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor profile not found", body.get("error"));
        verify(tutorService).getTutorByStudentId(100);
    }

    // TutorModule tests
    // WB-TUT-15: Test getAllTutorModules - successful retrieval
    @Test
    void getAllTutorModules_ShouldReturnListOfTutorModules() {
        // Arrange
        List<TutorModuleDTO> modules = Arrays.asList(testTutorModuleDTO);
        when(tutorModuleService.findAll()).thenReturn(modules);

        // Act
        ResponseEntity<?> response = tutorController.getAllTutorModules();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<TutorModuleDTO> responseBody = (List<TutorModuleDTO>) response.getBody();
        assertEquals(1, responseBody.size());
        assertEquals(1, responseBody.get(0).getTutorId());
        verify(tutorModuleService).findAll();
    }

    // WB-TUT-16: Test getTutorModulesByTutorId - tutor exists with modules
    @Test
    void getTutorModulesByTutorId_WhenTutorExists_ShouldReturnTutorWithModules() {
        // Arrange
        when(tutorModuleService.findByTutorIdWithDetails(1)).thenReturn(testTutorWithModulesDTO);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModulesByTutorId(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorWithModulesDTO);
        TutorWithModulesDTO responseBody = (TutorWithModulesDTO) response.getBody();
        assertEquals(1, responseBody.getTutor().getId());
        assertEquals(1, responseBody.getModules().size());
        assertEquals("CS101", responseBody.getModules().get(0).getModule_code());
        verify(tutorModuleService).findByTutorIdWithDetails(1);
    }

    // WB-TUT-17: Test getTutorModulesByTutorId - tutor not found
    @Test
    void getTutorModulesByTutorId_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorModuleService.findByTutorIdWithDetails(999)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModulesByTutorId(999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found", body.get("error"));
        verify(tutorModuleService).findByTutorIdWithDetails(999);
    }

    // WB-TUT-18: Test getTutorModulesByModuleId - successful retrieval
    @Test
    void getTutorModulesByModuleId_ShouldReturnTutorModules() {
        // Arrange
        List<TutorModuleDTO> modules = Arrays.asList(testTutorModuleDTO);
        when(tutorModuleService.findByModuleId(1)).thenReturn(modules);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModulesByModuleId(1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<TutorModuleDTO> responseBody = (List<TutorModuleDTO>) response.getBody();
        assertEquals(1, responseBody.size());
        assertEquals(1, responseBody.get(0).getModuleId());
        verify(tutorModuleService).findByModuleId(1);
    }

    // WB-TUT-19: Test getTutorModuleById - successful retrieval
    @Test
    void getTutorModuleById_WhenExists_ShouldReturnTutorModule() {
        // Arrange
        when(tutorModuleService.findByTutorIdAndModuleIdWithDetails(1, 1)).thenReturn(testTutorWithModulesDTO);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModuleById(1, 1);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorWithModulesDTO);
        verify(tutorModuleService).findByTutorIdAndModuleIdWithDetails(1, 1);
    }

    // WB-TUT-20: Test getTutorModuleById - tutor not found
    @Test
    void getTutorModuleById_WhenTutorNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorModuleService.findByTutorIdAndModuleIdWithDetails(999, 1)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModuleById(999, 1);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor not found", body.get("error"));
        verify(tutorModuleService).findByTutorIdAndModuleIdWithDetails(999, 1);
    }

    // WB-TUT-21: Test getTutorModuleById - tutor module not found
    @Test
    void getTutorModuleById_WhenTutorModuleNotFound_ShouldReturnNotFound() {
        // Arrange
        TutorWithModulesDTO emptyResult = new TutorWithModulesDTO(testTutorDTO, Collections.emptyList());
        when(tutorModuleService.findByTutorIdAndModuleIdWithDetails(1, 999)).thenReturn(emptyResult);

        // Act
        ResponseEntity<?> response = tutorController.getTutorModuleById(1, 999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("TutorModule not found", body.get("error"));
        verify(tutorModuleService).findByTutorIdAndModuleIdWithDetails(1, 999);
    }

    // WB-TUT-22: Test createTutorModule - successful creation
    @Test
    void createTutorModule_WithValidData_ShouldCreateTutorModule() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(1, 1);
        when(tutorModuleService.create(dto)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = tutorController.createTutorModule(1, dto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorModuleDTO);
        TutorModuleDTO responseBody = (TutorModuleDTO) response.getBody();
        assertEquals(1, responseBody.getTutorId());
        assertEquals(1, responseBody.getModuleId());
        verify(tutorModuleService).create(dto);
    }

    // WB-TUT-23: Test createTutorModule - ID mismatch
    @Test
    void createTutorModule_WithIdMismatch_ShouldReturnBadRequest() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(2, 1); // tutorId 2 vs path 1

        // Act
        ResponseEntity<?> response = tutorController.createTutorModule(1, dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor ID in path and body must match", body.get("error"));
        verify(tutorModuleService, never()).create(any());
    }

    // WB-TUT-24: Test createTutorModule - invalid data
    @Test
    void createTutorModule_WithInvalidData_ShouldReturnBadRequest() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(1, 1);
        when(tutorModuleService.create(dto)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.createTutorModule(1, dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Invalid tutor or module ID, or already assigned", body.get("error"));
        verify(tutorModuleService).create(dto);
    }

    // WB-TUT-25: Test updateTutorModule - successful update
    @Test
    void updateTutorModule_WithValidData_ShouldUpdateTutorModule() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(1, 1);
        when(tutorModuleService.update(1, 1, dto)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = tutorController.updateTutorModule(1, 1, dto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TutorModuleDTO);
        verify(tutorModuleService).update(1, 1, dto);
    }

    // WB-TUT-26: Test updateTutorModule - ID mismatch
    @Test
    void updateTutorModule_WithIdMismatch_ShouldReturnBadRequest() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(2, 2); // Different from path (1, 1)

        // Act
        ResponseEntity<?> response = tutorController.updateTutorModule(1, 1, dto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Tutor ID and Module ID in path and body must match", body.get("error"));
        verify(tutorModuleService, never()).update(anyInt(), anyInt(), any());
    }

    // WB-TUT-27: Test updateTutorModule - tutor module not found
    @Test
    void updateTutorModule_WhenNotFound_ShouldReturnNotFound() {
        // Arrange
        TutorModuleDTO dto = new TutorModuleDTO(1, 1);
        when(tutorModuleService.update(999, 999, dto)).thenReturn(null);

        // Act
        ResponseEntity<?> response = tutorController.updateTutorModule(999, 999, dto);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("TutorModule not found", body.get("error"));
        verify(tutorModuleService).update(999, 999, dto);
    }

    // WB-TUT-28: Test deleteTutorModule - successful deletion
    @Test
    void deleteTutorModule_WhenExists_ShouldReturnNoContent() {
        // Arrange
        when(tutorModuleService.delete(1, 1)).thenReturn(true);

        // Act
        ResponseEntity<?> response = tutorController.deleteTutorModule(1, 1);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(tutorModuleService).delete(1, 1);
    }

    // WB-TUT-29: Test deleteTutorModule - not found
    @Test
    void deleteTutorModule_WhenNotFound_ShouldReturnNotFound() {
        // Arrange
        when(tutorModuleService.delete(999, 999)).thenReturn(false);

        // Act
        ResponseEntity<?> response = tutorController.deleteTutorModule(999, 999);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("TutorModule not found", body.get("error"));
        verify(tutorModuleService).delete(999, 999);
    }
}