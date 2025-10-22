package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.Modules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Modules,Integer> {
    @Query("SELECT m FROM Modules m LEFT JOIN FETCH m.studentModules sm LEFT JOIN FETCH sm.student WHERE m.id = :moduleId")
    Modules findByIdWithStudents(@Param("moduleId") Integer moduleId);

    List<Modules> findAll();
    @Query("SELECT m FROM Modules m WHERE LOWER(m.module_name) = LOWER(:moduleName)")
    Optional<Modules> findByModuleNameIgnoreCase(String moduleName);
}
