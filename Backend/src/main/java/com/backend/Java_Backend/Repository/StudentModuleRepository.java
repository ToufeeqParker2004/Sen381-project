package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Models.StudentModuleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentModuleRepository extends JpaRepository<StudentModule, StudentModuleId> {
    List<StudentModule> findByStudentId(int studentId);
}
