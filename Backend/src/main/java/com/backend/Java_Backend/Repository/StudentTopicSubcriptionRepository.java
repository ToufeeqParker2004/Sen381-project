package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.StudentTopicSubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface StudentTopicSubcriptionRepository extends JpaRepository<StudentTopicSubscription, StudentTopicSubscriptionId> {
    List<StudentTopicSubscription> findByStudentId(int studentId);

    List<StudentTopicSubscription> findByTopicId(int topicId);

}
