package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.StudentTopicSubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentTopicSubcriptionRepository extends JpaRepository<StudentTopicSubscription, StudentTopicSubscriptionId> {
    List<StudentTopicSubscription> findByStudentId(int studentId);

    List<StudentTopicSubscription> findByTopicId(int topicId);

}
