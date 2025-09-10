package com.backend.Java_Backend.Services;



import com.backend.Java_Backend.Models.Student;
import com.backend.Java_Backend.Models.StudentTutorSubscription;
import com.backend.Java_Backend.Models.Tutor;
import com.backend.Java_Backend.Repository.StudentTutorSubscriptionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentTutorSubscriptionService {

    private final StudentTutorSubscriptionRepository repository;

    public StudentTutorSubscriptionService(StudentTutorSubscriptionRepository repository) {
        this.repository = repository;
    }

    // Subscribe a student to a tutor
    public StudentTutorSubscription subscribe(Student student, Tutor tutor) {
        StudentTutorSubscription sts = new StudentTutorSubscription(student, tutor);
        return repository.save(sts);
    }

    // Get tutors for a student
    public List<Tutor> getTutorsForStudent(int studentId) {
        List<StudentTutorSubscription> subscriptions = repository.findByStudentId(studentId);
        List<Tutor> tutors = new ArrayList<>();
        for (StudentTutorSubscription sts : subscriptions) {
            tutors.add(sts.getTutor());
        }
        return tutors;
    }

    // Get students for a tutor
    public List<Student> getStudentsForTutor(int tutorId) {
        List<StudentTutorSubscription> subscriptions = repository.findByTutorId(tutorId);
        List<Student> students = new ArrayList<>();
        for (StudentTutorSubscription sts : subscriptions) {
            students.add(sts.getStudent());
        }
        return students;
    }
}

