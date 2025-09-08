package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigInteger;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Student findByEmail(String email);
    Student findByPhoneNumber(String phoneNumber);
}
