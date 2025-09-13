package com.backend.Java_Backend.Services;

import com.backend.Java_Backend.DTO.StudentSubscriptionsDTO;
import com.backend.Java_Backend.DTO.StudentTopicSubscriptionDTO;
import com.backend.Java_Backend.DTO.StudentTutorSubscriptionDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class StudentSubscriptionService {
    @Autowired
    private StudentTopicSubscriptionService topicSubscriptionService;
    @Autowired
    private StudentTutorSubscriptionService tutorSubscriptionService;

    @Transactional
    public StudentSubscriptionsDTO create(StudentSubscriptionsDTO dto) {
        List<StudentTopicSubscriptionDTO> topicSubs = dto.getTopicSubscriptions().stream()
                .map(topicSub -> topicSubscriptionService.create(topicSub))
                .toList();
        List<StudentTutorSubscriptionDTO> tutorSubs = dto.getTutorSubscriptions().stream()
                .map(tutorSub -> tutorSubscriptionService.create(tutorSub))
                .toList();
        return new StudentSubscriptionsDTO(dto.getStudentId(), topicSubs, tutorSubs);
    }

    public StudentSubscriptionsDTO findByStudentId(int studentId) {
        return new StudentSubscriptionsDTO(
                studentId,
                topicSubscriptionService.findByStudentId(studentId),
                tutorSubscriptionService.findByStudentId(studentId)
        );
    }

    @Transactional
    public StudentSubscriptionsDTO update(int studentId, StudentSubscriptionsDTO dto) {
        topicSubscriptionService.findByStudentId(studentId).forEach(sub ->
                topicSubscriptionService.delete(sub.getStudentId(), sub.getTopicId()));
        tutorSubscriptionService.findByStudentId(studentId).forEach(sub ->
                tutorSubscriptionService.delete(sub.getStudentId(), sub.getTutorId()));
        return create(dto);
    }

    @Transactional
    public void delete(int studentId) {
        topicSubscriptionService.findByStudentId(studentId).forEach(sub ->
                topicSubscriptionService.delete(sub.getStudentId(), sub.getTopicId()));
        tutorSubscriptionService.findByStudentId(studentId).forEach(sub ->
                tutorSubscriptionService.delete(sub.getStudentId(), sub.getTutorId()));
    }
}
