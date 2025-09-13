package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic,Integer> {
    @Query("SELECT t FROM Topic t WHERE t.module_id = :module_id")
    List<Topic> findByModule_id(@Param("module_id") int module_id);
    @Query("SELECT t FROM Topic t WHERE t.creator_id = :creator_id")
    List<Topic> findByCreator_id(@Param("creator_id") int creator_id);

}
