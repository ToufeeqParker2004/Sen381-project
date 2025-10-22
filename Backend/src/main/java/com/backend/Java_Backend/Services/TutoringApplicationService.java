package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.ApplicantDayAvailabilityDTO;
import com.backend.Java_Backend.DTO.TutoringApplicationDTO;
import com.backend.Java_Backend.Models.*;
import com.backend.Java_Backend.Repository.*;
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
                availabilityJson = objectMapper.readValue(dto.getAvailabilityJson(), Map.class);
            } else {
                availabilityJson = null;
            }
        } catch (Exception e) {
            logger.error("Invalid availabilityJson format", e);
            throw new IllegalArgumentException("Invalid availabilityJson format", e);
        }

        TutoringStudentApplication application = new TutoringStudentApplication();
        application.setStudent(student);
        application.setStatus(ApplicationStatus.PENDING);
        application.setApplicationTranscript(fileName);
        application.setModules(dto.getModules());
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

        return applicationRepository.save(application);
    }

    @Transactional
    public String getTranscriptUrl(UUID applicationId) {
        TutoringStudentApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        String fileName = app.getApplicationTranscript();
        if (fileName == null || fileName.isEmpty()) {
            logger.error("No transcript file found for application ID: {}", applicationId);
            throw new IllegalArgumentException("No transcript file found for application");
        }
        // Encode only the file name part, preserving folder slashes
        String[] pathParts = fileName.split("/", -1);
        String encodedFileName = fileName;
        if (pathParts.length > 1) {
            String folder = String.join("/", Arrays.copyOfRange(pathParts, 0, pathParts.length - 1));
            String filePart = pathParts[pathParts.length - 1];
            encodedFileName = folder + "/" + URLEncoder.encode(filePart, StandardCharsets.UTF_8).replace("+", "%20");
        } else {
            encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        }
        String signedUrlApi = SUPABASE_URL + "/storage/v1/object/sign/" + BUCKET_NAME + "/" + encodedFileName;

        logger.debug("Attempting to generate signed URL for file: {}, API: {}", fileName, signedUrlApi);
        try {
            String jsonBody = objectMapper.writeValueAsString(new HashMap<String, Object>() {{
                put("expiresIn", 3600);
            }});
            logger.debug("Request body: {}", jsonBody);
            RequestBody body = RequestBody.create(jsonBody, MediaType.parse("application/json"));
            Request request = new Request.Builder()
                    .url(signedUrlApi)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                    .addHeader("Content-Type", "application/json")
                    .build();
            Response response = httpClient.newCall(request).execute();
            if (!response.isSuccessful()) {
                String responseBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Failed to create signed URL for file {}: HTTP {} {} - {}", fileName, response.code(), response.message(), responseBody);
                // Fallback: Try without transcripts/ prefix
                String fallbackFileName = fileName.startsWith("transcripts/") ? fileName.substring("transcripts/".length()) : fileName;
                String encodedFallbackFileName = URLEncoder.encode(fallbackFileName, StandardCharsets.UTF_8).replace("+", "%20");
                String fallbackSignedUrlApi = SUPABASE_URL + "/storage/v1/object/sign/" + BUCKET_NAME + "/" + encodedFallbackFileName;
                logger.debug("Retrying with fallback URL: {}", fallbackSignedUrlApi);
                request = new Request.Builder()
                        .url(fallbackSignedUrlApi)
                        .post(body)
                        .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                        .addHeader("Content-Type", "application/json")
                        .build();
                response = httpClient.newCall(request).execute();
                if (!response.isSuccessful()) {
                    responseBody = response.body() != null ? response.body().string() : "No response body";
                    logger.error("Fallback failed for file {}: HTTP {} {} - {}", fallbackFileName, response.code(), response.message(), responseBody);
                    throw new RuntimeException("Failed to create signed URL: HTTP " + response.code() + " " + response.message() + " - " + responseBody);
                }
            }
            String responseBody = response.body().string();
            logger.debug("Signed URL response: {}", responseBody);
            Map<String, String> responseMap = objectMapper.readValue(responseBody, Map.class);
            String signedUrl = responseMap.getOrDefault("signedURL", responseMap.get("url"));
            if (signedUrl == null) {
                logger.error("Signed URL not found in response for file {}: {}", fileName, responseBody);
                throw new RuntimeException("Signed URL not found in response");
            }
            String finalUrl = signedUrl.startsWith("http") ? signedUrl : SUPABASE_URL + signedUrl;
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
        Tutor tutor = tutorRepository.findByStudent_id(studentId)
                .orElseGet(() -> {
                    Tutor newTutor = new Tutor();
                    newTutor.setStudent_id(studentId);
                    newTutor.setCreated_at(new Timestamp(System.currentTimeMillis()));
                    return tutorRepository.save(newTutor);
                });

        Map<String, List<Map<String, String>>> availability = app.getAvailabilityJson();
        if (availability != null && availability.containsKey("availability")) {
            List<Map<String, String>> slots = availability.get("availability");
            for (Map<String, String> slot : slots) {
                Integer dayOfWeek = DAY_TO_INT.get(slot.get("day"));
                if (dayOfWeek == null) {
                    logger.warn("Skipping invalid day: {}", slot.get("day"));
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
                availabilityRepository.save(availabilityRecord);
            }
        }

        app.setStatus(ApplicationStatus.ACCEPTED);
        app.setTutor(tutor);
        applicationRepository.save(app);
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
        applicationRepository.save(app);
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

    public TutoringStudentApplication getApplication(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }
    public List<TutoringStudentApplication> getAllApplications() {
        return applicationRepository.findAll();
    }
}