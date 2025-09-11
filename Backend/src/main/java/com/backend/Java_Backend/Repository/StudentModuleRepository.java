package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Models.StudentModuleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface StudentModuleRepository extends JpaRepository<StudentModule, StudentModuleId> {
    List<StudentModule> findByStudentId(int studentId);
}
