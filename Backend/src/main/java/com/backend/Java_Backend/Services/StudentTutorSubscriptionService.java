package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.DTO.StudentTutorSubscriptionDTO;
import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentTutorSubscription;
import com.backend.Java_Backend.Models.StudentTutorSubscriptionId;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.StudentRepository;
import com.backend.Java_Backend.Repository.StudentTutorSubscriptionRepository;
import com.backend.Java_Backend.Repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentTutorSubscriptionService {

    @Autowired
    private StudentTutorSubscriptionRepository repository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TutorRepository tutorRepository;

    public StudentTutorSubscriptionDTO create(StudentTutorSubscriptionDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Tutor tutor = tutorRepository.findById(dto.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        StudentTutorSubscription subscription = new StudentTutorSubscription(student, tutor);
        repository.save(subscription);
        return new StudentTutorSubscriptionDTO(subscription.getStudent().getId(), subscription.getTutor().getId(), subscription.getCreatedAt());
    }
    public StudentTutorSubscriptionDTO findById(int studentId, int tutorId) {
        StudentTutorSubscription subscription = repository.findById(new StudentTutorSubscriptionId(studentId, tutorId))
                .orElseThrow(() -> new RuntimeException("StudentTutorSubscription not found for studentId: " + studentId + " and tutorId: " + tutorId));
        return new StudentTutorSubscriptionDTO(subscription.getStudent().getId(), subscription.getTutor().getId(), subscription.getCreatedAt());
    }
    public List<StudentTutorSubscriptionDTO> findAll() {
        return repository.findAll().stream()
                .map(sub -> new StudentTutorSubscriptionDTO(sub.getStudent().getId(), sub.getTutor().getId(), sub.getCreatedAt()))
                .collect(Collectors.toList());
    }
    public StudentTutorSubscriptionDTO update(int studentId, int tutorId, StudentTutorSubscriptionDTO dto) {
        StudentTutorSubscription subscription = repository.findById(new StudentTutorSubscriptionId(studentId, tutorId))
                .orElseThrow(() -> new RuntimeException("StudentTutorSubscription not found for studentId: " + studentId + " and tutorId: " + tutorId));
        if (dto.getCreatedAt() != null) {
            subscription.setCreatedAt(dto.getCreatedAt());
        }
        repository.save(subscription);
        return new StudentTutorSubscriptionDTO(subscription.getStudent().getId(), subscription.getTutor().getId(), subscription.getCreatedAt());
    }
    public List<StudentTutorSubscriptionDTO> findByStudentId(int studentId) {
        return repository.findByStudentId(studentId).stream()
                .map(sub -> new StudentTutorSubscriptionDTO(sub.getStudent().getId(), sub.getTutor().getId(), sub.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<StudentTutorSubscriptionDTO> findByTutorId(int tutorId) {
        return repository.findByTutorId(tutorId).stream()
                .map(sub -> new StudentTutorSubscriptionDTO(sub.getStudent().getId(), sub.getTutor().getId(), sub.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void delete(int studentId, int tutorId) {
        repository.deleteById(new StudentTutorSubscriptionId(studentId, tutorId));
    }
}

