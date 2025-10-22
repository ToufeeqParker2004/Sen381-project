package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.ApplicantDayAvailabilityDTO;
import com.backend.Java_Backend.DTO.TutoringApplicationDTO;
import com.backend.Java_Backend.Models.*;
import com.backend.Java_Backend.Repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TutoringApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(TutoringApplicationService.class);

    @Autowired
    private TutoringStudentApplicationRepository applicationRepository;
    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private AvailabilityRepository availabilityRepository;
    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private TutorModuleRepository tutorModuleRepository;
    @Autowired
    private OkHttpClient httpClient;
    @Autowired
    private ObjectMapper objectMapper;

    private static final String SUPABASE_URL = "https://moikeoljuxygsrnuhfws.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWtlb2xqdXh5Z3NybnVoZndzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA2OTM2MywiZXhwIjoyMDc1NjQ1MzYzfQ.zgs01Qf6Hf3dm7O4RIQ4uC_tNL2EXaA6UPQnHMPrzu4";

    private static final String BUCKET_NAME = "TutorApplication";

    private static final Map<String, Integer> DAY_TO_INT = new HashMap<>();
    static {
        DAY_TO_INT.put("Monday", 1);
        DAY_TO_INT.put("Tuesday", 2);
        DAY_TO_INT.put("Wednesday", 3);
        DAY_TO_INT.put("Thursday", 4);
        DAY_TO_INT.put("Friday", 5);
        DAY_TO_INT.put("Saturday", 6);
        DAY_TO_INT.put("Sunday", 7);
    }

    @Transactional
    public TutoringStudentApplication createApplication(TutoringApplicationDTO dto) {
        if (dto.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        MultipartFile transcript = dto.getApplicationTranscript();
        if (transcript == null || transcript.isEmpty()) {
            throw new IllegalArgumentException("Transcript PDF is required");
        }
        if (!"application/pdf".equals(transcript.getContentType())) {
            throw new IllegalArgumentException("File must be a PDF");
        }

        String originalFileName = transcript.getOriginalFilename();
        String sanitizedFileName = originalFileName != null
                ? originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_")
                : "transcript.pdf";
        String fileName = "transcripts/" + UUID.randomUUID() + "_" + sanitizedFileName;
        String uploadUrl = SUPABASE_URL + "/storage/v1/object/" + BUCKET_NAME + "/" + fileName;

        try {
            RequestBody fileBody = RequestBody.create(transcript.getBytes(), MediaType.parse("application/pdf"));
            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .post(fileBody)
                    .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                    .addHeader("Content-Type", "application/pdf")
                    .build();
            Response response = httpClient.newCall(request).execute();
            if (!response.isSuccessful()) {
                String responseBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Failed to upload PDF to {}: HTTP {} {} - {}", fileName, response.code(), response.message(), responseBody);
                throw new RuntimeException("Failed to upload PDF: HTTP " + response.code() + " " + response.message() + " - " + responseBody);
            }
            response.close();
        } catch (Exception e) {
            logger.error("Failed to upload PDF to Supabase Storage: {}", fileName, e);
            throw new RuntimeException("Failed to upload PDF to Supabase Storage", e);
        }

        Map<String, List<Map<String, String>>> availabilityJson;
        try {
            if (dto.getAvailabilityJson() != null && !dto.getAvailabilityJson().isEmpty()) {
                availabilityJson = objectMapper.readValue(dto.getAvailabilityJson(), new TypeReference<Map<String, List<Map<String, String>>>>() {});
            } else {
                availabilityJson = null;
            }
        } catch (Exception e) {
            logger.error("Invalid availabilityJson format: {}", dto.getAvailabilityJson(), e);
            throw new IllegalArgumentException("Invalid availabilityJson format", e);
        }

        List<String> modules;
        if (dto.getModules() != null && !dto.getModules().isEmpty()) {
            logger.debug("Received modules: {}", dto.getModules());
            modules = dto.getModules().stream()
                    .filter(module -> module != null && !module.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toList());
            logger.debug("Processed modules: {}", modules);
        } else {
            modules = new ArrayList<>();
            logger.debug("No modules provided in DTO");
        }

        TutoringStudentApplication application = new TutoringStudentApplication();
        application.setStudent(student);
        application.setStatus(ApplicationStatus.PENDING);
        application.setApplicationTranscript(fileName);
        application.setModules(modules);
        application.setExperienceDescription(dto.getExperienceDescription());
        application.setAvailabilityJson(availabilityJson);
        application.setCreatedAt(LocalDateTime.now());

        if (availabilityJson != null && availabilityJson.containsKey("availability")) {
            List<Map<String, String>> slots = availabilityJson.get("availability");
            for (Map<String, String> slot : slots) {
                if (!DAY_TO_INT.containsKey(slot.get("day"))) {
                    throw new IllegalArgumentException("Invalid day: " + slot.get("day"));
                }
                LocalTime start = LocalTime.parse(slot.get("start"));
                LocalTime end = LocalTime.parse(slot.get("end"));
                if (!start.isBefore(end)) {
                    throw new IllegalArgumentException("End time must be after start time for day: " + slot.get("day"));
                }
            }
        }

        try {
            TutoringStudentApplication savedApplication = applicationRepository.save(application);
            logger.debug("Saved application with ID: {}, modules: {}", savedApplication.getId(), savedApplication.getModules());
            return savedApplication;
        } catch (Exception e) {
            logger.error("Failed to save application: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save application", e);
        }
    }

    @Transactional
    public String getTranscriptUrl(UUID applicationId) {
        TutoringStudentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        String fileName = app.getApplicationTranscript();
        if (fileName == null || fileName.isEmpty()) {
            throw new IllegalArgumentException("No transcript file associated with this application");
        }

        String encodedFileName;
        try {
            encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString()).replace("+", "%20");
        } catch (Exception e) {
            logger.error("Failed to encode file name: {}", fileName, e);
            throw new RuntimeException("Failed to encode file name", e);
        }

        String url = SUPABASE_URL + "/storage/v1/object/sign/" + BUCKET_NAME + "/" + encodedFileName + "?download=true";
        try {
            FormBody body = new FormBody.Builder()
                    .add("expiresIn", "3600")
                    .build();
            Request request = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                    .build();
            Response response = httpClient.newCall(request).execute();
            if (!response.isSuccessful()) {
                String responseBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Failed to generate signed URL for {}: HTTP {} {} - {}", fileName, response.code(), response.message(), responseBody);
                throw new RuntimeException("Failed to generate signed URL: HTTP " + response.code() + " " + response.message() + " - " + responseBody);
            }
            String responseBody = response.body() != null ? response.body().string() : "{}";
            Map<String, String> responseMap = objectMapper.readValue(responseBody, new TypeReference<Map<String, String>>() {});
            String signedUrl = responseMap.get("signedURL") != null ? responseMap.get("signedURL") : responseMap.getOrDefault("url", responseMap.get("signedUrl"));
            if (signedUrl == null) {
                logger.error("Signed URL not found in response for file {}: {}", fileName, responseBody);
                throw new RuntimeException("Signed URL not found in response");
            }
            String finalUrl = signedUrl.startsWith("http") ? signedUrl : SUPABASE_URL + "/storage/v1" + signedUrl;
            logger.debug("Generated signed URL: {}", finalUrl);
            response.close();
            return finalUrl;
        } catch (Exception e) {
            logger.error("Failed to generate signed URL for application ID: {}, file: {}", applicationId, fileName, e);
            throw new RuntimeException("Failed to generate signed URL", e);
        }
    }

    @Transactional
    public void approveApplication(UUID applicationId) {
        TutoringStudentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Application is not pending");
        }

        // Check if a Tutor already exists for this student_id
        Integer studentId = app.getStudent().getId();
        logger.debug("Processing approval for student_id: {}", studentId);
        Tutor tutor = tutorRepository.findByStudent_id(studentId)
                .orElseGet(() -> {
                    Tutor newTutor = new Tutor();
                    newTutor.setStudent_id(studentId);
                    newTutor.setCreated_at(new Timestamp(System.currentTimeMillis()));
                    Tutor savedTutor = tutorRepository.save(newTutor);
                    logger.debug("Created new tutor with ID: {} for student_id: {}", savedTutor.getId(), studentId);
                    return savedTutor;
                });

        // Handle modules, accounting for possible JSON string in modules field
        List<String> moduleNames;
        try {
            List<String> rawModules = app.getModules() != null ? app.getModules() : new ArrayList<>();
            logger.debug("Raw modules from application: {}", rawModules);
            if (!rawModules.isEmpty() && rawModules.get(0).startsWith("[") && rawModules.get(0).endsWith("]")) {
                // Handle case where modules is a single JSON string
                moduleNames = objectMapper.readValue(rawModules.get(0), new TypeReference<List<String>>() {});
                logger.debug("Parsed JSON modules: {}", moduleNames);
            } else {
                // Handle case where modules is already a List<String>
                moduleNames = rawModules.stream()
                        .filter(module -> module != null && !module.trim().isEmpty())
                        .map(String::trim)
                        .collect(Collectors.toList());
                logger.debug("Processed modules: {}", moduleNames);
            }
        } catch (Exception e) {
            logger.error("Failed to parse modules for application ID: {}: {}", applicationId, e.getMessage(), e);
            throw new IllegalArgumentException("Invalid modules format: " + app.getModules(), e);
        }

        // Assign modules to tutor
        List<String> unmatchedModules = new ArrayList<>();
        if (moduleNames.isEmpty()) {
            logger.warn("No modules provided for application ID: {}", applicationId);
        }

        for (String moduleName : moduleNames) {
            if (moduleName == null || moduleName.trim().isEmpty()) {
                logger.warn("Skipping empty or null module name for application ID: {}", applicationId);
                unmatchedModules.add(moduleName);
                continue;
            }
            Optional<Modules> moduleOpt = moduleRepository.findByModuleNameIgnoreCase(moduleName.trim());
            if (moduleOpt.isPresent()) {
                Modules module = moduleOpt.get();
                logger.debug("Found module '{}' with ID: {}", module.getModule_name(), module.getId());
                TutorModuleId tutorModuleId = new TutorModuleId(tutor.getId(), module.getId());
                if (!tutorModuleRepository.existsById(tutorModuleId)) {
                    TutorModule tutorModule = new TutorModule(tutor, module);
                    try {
                        tutorModuleRepository.save(tutorModule);
                        logger.info("Assigned module {} (ID: {}) to tutor {} (ID: {})",
                                module.getModule_name(), module.getId(), tutor.getId(), tutor.getId());
                    } catch (Exception e) {
                        logger.error("Failed to save TutorModule for tutor_id: {}, module_id: {}: {}",
                                tutor.getId(), module.getId(), e.getMessage(), e);
                        unmatchedModules.add(moduleName);
                    }
                } else {
                    logger.info("Module {} (ID: {}) already assigned to tutor {} (ID: {})",
                            module.getModule_name(), module.getId(), tutor.getId(), tutor.getId());
                }
            } else {
                unmatchedModules.add(moduleName);
                logger.warn("Module not found for name: {} in Modules table", moduleName);
            }
        }

        // Log unmatched modules and throw exception if no modules were assigned
        if (!unmatchedModules.isEmpty()) {
            logger.warn("The following modules could not be assigned to tutor {} (ID: {}): {}",
                    tutor.getId(), tutor.getId(), unmatchedModules);
            if (moduleNames.size() == unmatchedModules.size() && !moduleNames.isEmpty()) {
                throw new IllegalArgumentException("No valid modules found for assignment: " + unmatchedModules);
            }
        }

        // Handle availability
        Map<String, List<Map<String, String>>> availability = app.getAvailabilityJson();
        if (availability != null && availability.containsKey("availability")) {
            List<Map<String, String>> slots = availability.get("availability");
            for (Map<String, String> slot : slots) {
                Integer dayOfWeek = DAY_TO_INT.get(slot.get("day"));
                if (dayOfWeek == null) {
                    logger.warn("Skipping invalid day: {} for application ID: {}", slot.get("day"), applicationId);
                    continue;
                }

                LocalTime start = LocalTime.parse(slot.get("start"));
                LocalTime end = LocalTime.parse(slot.get("end"));

                Availability availabilityRecord = new Availability();
                availabilityRecord.setTutor(tutor);
                availabilityRecord.setDayOfWeek(dayOfWeek);
                availabilityRecord.setStartTime(start);
                availabilityRecord.setEndTime(end);
                availabilityRecord.setStartDate(null);
                availabilityRecord.setEndDate(null);
                availabilityRecord.setRecurring(true);
                availabilityRecord.setSlotDurationMinutes(60);
                try {
                    availabilityRepository.save(availabilityRecord);
                    logger.debug("Saved availability for tutor_id: {}, day: {}, start: {}, end: {}",
                            tutor.getId(), slot.get("day"), start, end);
                } catch (Exception e) {
                    logger.error("Failed to save availability for tutor_id: {}, day: {}: {}",
                            tutor.getId(), slot.get("day"), e.getMessage(), e);
                }
            }
        }

        app.setStatus(ApplicationStatus.ACCEPTED);
        app.setTutor(tutor);
        try {
            applicationRepository.save(app);
            logger.debug("Updated application ID: {} to status ACCEPTED with tutor_id: {}",
                    applicationId, tutor.getId());
        } catch (Exception e) {
            logger.error("Failed to save application ID: {}: {}", applicationId, e.getMessage(), e);
            throw new RuntimeException("Failed to update application status", e);
        }
    }

    @Transactional
    public void declineApplication(UUID applicationId) {
        TutoringStudentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Application is not pending");
        }
        app.setStatus(ApplicationStatus.DECLINED);
        app.setTutor(null);
        try {
            applicationRepository.save(app);
            logger.debug("Updated application ID: {} to status DECLINED", applicationId);
        } catch (Exception e) {
            logger.error("Failed to save application ID: {}: {}", applicationId, e.getMessage(), e);
            throw new RuntimeException("Failed to update application status", e);
        }
    }

    public List<ApplicantDayAvailabilityDTO> getApplicantsByDayAvailability() {
        List<Object[]> results = applicationRepository.findApplicantsByDayAvailability();
        return results.stream()
                .map(row -> new ApplicantDayAvailabilityDTO(
                        (UUID) row[0],
                        ((Number) row[1]).intValue(),
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteApplication(UUID applicationId) {
        TutoringStudentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        String fileName = app.getApplicationTranscript();
        if (fileName != null && !fileName.isEmpty()) {
            String encodedFileName = fileName;
            try {
                String[] pathParts = fileName.split("/", -1);
                if (pathParts.length > 1) {
                    String folder = String.join("/", Arrays.copyOfRange(pathParts, 0, pathParts.length - 1));
                    String filePart = pathParts[pathParts.length - 1];
                    encodedFileName = folder + "/" + URLEncoder.encode(filePart, StandardCharsets.UTF_8).replace("+", "%20");
                } else {
                    encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
                }

                String deleteUrl = SUPABASE_URL + "/storage/v1/object/" + BUCKET_NAME + "/" + encodedFileName;
                Request request = new Request.Builder()
                        .url(deleteUrl)
                        .delete()
                        .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                        .build();
                Response response = httpClient.newCall(request).execute();
                if (!response.isSuccessful()) {
                    String responseBody = response.body() != null ? response.body().string() : "No response body";
                    logger.warn("Failed to delete file {} from Supabase: HTTP {} {} - {}", fileName, response.code(), response.message(), responseBody);
                }
                response.close();
            } catch (Exception e) {
                logger.warn("Failed to delete file {} from Supabase Storage: {}", fileName, e.getMessage());
            }
        }

        try {
            applicationRepository.delete(app);
            logger.debug("Deleted application ID: {}", applicationId);
        } catch (Exception e) {
            logger.error("Failed to delete application ID: {}: {}", applicationId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete application", e);
        }
    }

    public TutoringStudentApplication getApplication(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    public List<TutoringStudentApplication> getAllApplications() {
        return applicationRepository.findAll();
    }
}