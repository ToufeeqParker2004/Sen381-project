package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentTutorSubscription;
import com.backend.Java_Backend.Models.StudentTutorSubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentTutorSubscriptionRepository extends JpaRepository<StudentTutorSubscription, StudentTutorSubscriptionId> {

    List<StudentTutorSubscription> findByStudentId(int studentId);

    List<StudentTutorSubscription> findByTutorId(int tutorId);
}