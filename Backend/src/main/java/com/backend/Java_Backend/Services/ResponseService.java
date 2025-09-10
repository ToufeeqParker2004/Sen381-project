package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.Models.Response;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Repository.ResponseRepository;
import com.backend.Java_Backend.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResponseService {
    private final ResponseRepository responseRepository;

    @Autowired
    public ResponseService(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    // Get all responses
    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    // Get a responses by ID
    public Optional<Response> getResponseById(UUID id) {
        return responseRepository.findById(id);
    }

    // Save or update a response
    public Response saveResponse(Response response) {
        return responseRepository.save(response);
    }

    // Delete a response by ID
    public void deleteResponse(UUID id) {
        responseRepository.deleteById(id);
    }


}
