package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.StudentModule;
import com.backend.Java_Backend.Models.StudentModuleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentModuleRepository extends JpaRepository<StudentModule, StudentModuleId> {
    @Query("SELECT sm FROM StudentModule sm WHERE sm.id.studentId = :studentId")
    List<StudentModule> findByStudentId(@Param("studentId") Integer studentId);

    @Query("SELECT sm FROM StudentModule sm WHERE sm.id.moduleId = :moduleId")
    List<StudentModule> findByModuleId(@Param("moduleId") Integer moduleId);

    @Query("SELECT sm FROM StudentModule sm WHERE sm.id.studentId = :studentId AND sm.id.moduleId = :moduleId")
    Optional<StudentModule> findByStudentIdAndModuleId(@Param("studentId") Integer studentId, @Param("moduleId") Integer moduleId);
}
