package com.backend.Java_Backend.Controller;

import com.backend.Java_Backend.DTO.TopicDTO;
import com.backend.Java_Backend.Models.Topic;
import com.backend.Java_Backend.Services.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/topics")
public class TopicController {
    @Autowired
    private TopicService service;

    @PostMapping
    public ResponseEntity<TopicDTO> create(@RequestBody TopicDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<TopicDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicDTO> findById(@PathVariable int id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<TopicDTO>> findByModuleId(@PathVariable int moduleId) {
        return ResponseEntity.ok(service.findByModule_id(moduleId));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<TopicDTO>> findByCreatorId(@PathVariable int creatorId) {
        return ResponseEntity.ok(service.findByCreatorId(creatorId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicDTO> update(@PathVariable int id, @RequestBody TopicDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
