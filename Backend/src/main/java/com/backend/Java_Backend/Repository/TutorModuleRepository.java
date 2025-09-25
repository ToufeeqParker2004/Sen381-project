package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.TutorModule;
import com.backend.Java_Backend.Models.TutorModuleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TutorModuleRepository extends JpaRepository<TutorModule, TutorModuleId> {
    List<TutorModule> findByTutorId(int tutorId);
    List<TutorModule> findByModuleId(int moduleId);
    void deleteByIdTutorIdAndIdModuleId(Integer tutorId, Integer moduleId);
}

