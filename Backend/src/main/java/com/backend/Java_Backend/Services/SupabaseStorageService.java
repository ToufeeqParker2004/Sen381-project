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

    // Default bucket name for backward compatibility
    private static final String DEFAULT_BUCKET_NAME = "learning-materials";

    // Upload with specific bucket
    public String uploadFile(MultipartFile file, String bucketName) throws IOException {
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

            String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            System.out.println("Uploading to Supabase URL: " + url);
            System.out.println("Bucket: " + bucketName);
            System.out.println("File size: " + file.getSize() + " bytes");

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, String.class);

            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filePath;
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

    // Overloaded method for backward compatibility - uses default bucket
    public String uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, DEFAULT_BUCKET_NAME);
    }

    // Delete with specific bucket
    public void deleteFile(String fileUrl, String bucketName) {
        try {
            String filePath = extractFilePathFromUrl(fileUrl, bucketName);

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            System.out.println("Deleting from Supabase URL: " + url);
            System.out.println("Bucket: " + bucketName);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.DELETE, requestEntity, String.class);

            System.out.println("Supabase delete response status: " + response.getStatusCode());

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Delete failed with status: " + response.getStatusCode() + ", body: " + response.getBody());
            }

            System.out.println("File deleted successfully from bucket: " + bucketName);

        } catch (Exception e) {
            System.err.println("Supabase delete error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete file from Supabase bucket: " + bucketName, e);
        }
    }

    // Overloaded method for backward compatibility - uses default bucket
    public void deleteFile(String fileUrl) {
        deleteFile(fileUrl, DEFAULT_BUCKET_NAME);
    }

    // Download file (uses public URL, so no bucket needed)
    public ResponseEntity<byte[]> downloadFile(String fileUrl) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            System.out.println("Downloading file from URL: " + fileUrl);

            ResponseEntity<byte[]> response = restTemplate.getForEntity(fileUrl, byte[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

                // Extract filename from URL for content disposition
                String filename = extractFilenameFromUrl(fileUrl);
                headers.setContentDispositionFormData("attachment", filename);

                System.out.println("File downloaded successfully, size: " + response.getBody().length + " bytes");

                return new ResponseEntity<>(response.getBody(), headers, HttpStatus.OK);
            } else {
                throw new RuntimeException("Download failed with status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Supabase download error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to download file from URL: " + fileUrl, e);
        }
    }

    // Check if file exists in storage
    public boolean fileExists(String fileUrl, String bucketName) {
        try {
            String filePath = extractFilePathFromUrl(fileUrl, bucketName);

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(headers);

            String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.HEAD, requestEntity, String.class);

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("File existence check error: " + e.getMessage());
            return false;
        }
    }

    // Extract file path from URL for specific bucket
    private String extractFilePathFromUrl(String fileUrl, String bucketName) {
        if (fileUrl.contains("/object/public/" + bucketName + "/")) {
            String[] parts = fileUrl.split("/object/public/" + bucketName + "/");
            if (parts.length > 1) {
                return parts[1];
            }
        }
        throw new IllegalArgumentException("Invalid Supabase storage URL for bucket: " + bucketName + ". URL: " + fileUrl);
    }

    // Extract file path from URL for default bucket (backward compatibility)
    private String extractFilePathFromUrl(String fileUrl) {
        return extractFilePathFromUrl(fileUrl, DEFAULT_BUCKET_NAME);
    }

    // Extract filename from URL for download
    private String extractFilenameFromUrl(String fileUrl) {
        try {
            String[] parts = fileUrl.split("/");
            return parts[parts.length - 1];
        } catch (Exception e) {
            return "file";
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    // Utility method to get default bucket name
    public String getDefaultBucketName() {
        return DEFAULT_BUCKET_NAME;
    }
}