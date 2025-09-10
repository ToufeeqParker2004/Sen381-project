package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Student findByEmail(String email);
    Student findByPhoneNumber(String phoneNumber);
}
