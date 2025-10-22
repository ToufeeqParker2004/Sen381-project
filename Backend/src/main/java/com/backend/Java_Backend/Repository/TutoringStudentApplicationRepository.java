package com.backend.Java_Backend.Repository;

import com.backend.Java_Backend.Models.TutoringStudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface TutoringStudentApplicationRepository extends JpaRepository<TutoringStudentApplication, UUID> {
    @Query(value = """
        SELECT 
            tsa.id,
            CAST(tsa.student_id AS BIGINT) AS student_id,
            s.name AS student_name,
            COUNT(DISTINCT slot->>'day') AS unique_days
        FROM 
            tutoring_student_applications tsa
            JOIN students s ON tsa.student_id = s.id
            CROSS JOIN LATERAL jsonb_array_elements(
                tsa.availability_json->'availability'
            ) AS slot
        WHERE 
            tsa.status = 'Pending'
        GROUP BY 
            tsa.id, tsa.student_id, s.name
        ORDER BY 
            unique_days DESC
        """, nativeQuery = true)
    List<Object[]> findApplicantsByDayAvailability();
}
