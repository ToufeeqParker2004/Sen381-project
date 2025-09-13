package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentTopicSubscription;
import com.backend.Java_Backend.Models.StudentTopicSubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTopicSubscriptionRepository extends JpaRepository<StudentTopicSubscription, StudentTopicSubscriptionId> {
    List<StudentTopicSubscription> findByStudentId(int studentId);
    List<StudentTopicSubscription> findByTopicId(int topicId);
    Optional<StudentTopicSubscription> findById(StudentTopicSubscriptionId id);

}
