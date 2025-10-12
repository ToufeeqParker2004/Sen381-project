package com.backend.Java_Backend.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseKey;

    private static final String BUCKET_NAME = "learning-materials";

    public String uploadFile(MultipartFile file) throws IOException {
        try {
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + fileExtension;
            String filePath = "materials/" + fileName;

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("x-upsert", "true");

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            String url = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filePath;

            System.out.println("Uploading to Supabase URL: " + url);
            System.out.println("File size: " + file.getSize() + " bytes");

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, String.class);

            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + BUCKET_NAME + "/" + filePath;
                System.out.println("File uploaded successfully: " + publicUrl);
                return publicUrl;
            } else {
                throw new RuntimeException("Upload failed with status: " + response.getStatusCode() + ", body: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Supabase upload error: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to upload file to Supabase: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            String filePath = extractFilePathFromUrl(fileUrl);

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            String url = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filePath;

            restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from Supabase", e);
        }
    }

    public ResponseEntity<byte[]> downloadFile(String fileUrl) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            byte[] fileContent = restTemplate.getForObject(fileUrl, byte[].class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "file");

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file", e);
        }
    }

    private String extractFilePathFromUrl(String fileUrl) {
        if (fileUrl.contains("/object/public/")) {
            String[] parts = fileUrl.split("/object/public/");
            return parts[1];
        }
        throw new IllegalArgumentException("Invalid Supabase storage URL");
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}