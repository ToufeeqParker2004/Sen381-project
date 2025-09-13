package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Models.StudentModuleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface StudentModuleRepository extends JpaRepository<StudentModule, StudentModuleId> {
    @Query("SELECT sm FROM StudentModule sm WHERE sm.student.id = :studentId")
    List<StudentModule> findByStudentId(@Param("studentId") Integer studentId);

    @Query("SELECT sm FROM StudentModule sm WHERE sm.module.id = :moduleId")
    List<StudentModule> findByModuleId(@Param("moduleId") Integer moduleId);

    boolean existsByStudentIdAndModuleId(Integer studentId, Integer moduleId);
}
