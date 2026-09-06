package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Course;
import com.ubrs.ubrs_backend.domain.entity.CourseAssignment;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findCourseByIdAndIsDeleted(UUID id, Boolean isDeleted);

    List<Course> findAllByIsDeleted(Boolean isDeleted);

    List<Course> findAllByCourseLevelAndIsDeleted(ESchoolLevel courseLevel, Boolean isDeleted);

    @Query("SELECT c FROM Course c  LEFT JOIN CourseAssignment ca ON ca.course.id = c.id WHERE ca.schoolClass.id = :classId AND  ca.assignmentStatus = 'ACTIVE' ")
    List<Course> findAllCourseByClassId(UUID classId);

    @Query("""
    SELECT DISTINCT c
    FROM Course c
    JOIN CourseAssignment ca
        ON ca.course.id = c.id
    WHERE ca.teacher.id = :teacherId
      AND ca.assignmentStatus = 'ACTIVE'
      AND ca.isDeleted = false
      AND c.isDeleted = false
    """)
    List<Course> findAllByTeacherId(@Param("teacherId") UUID teacherId);


    @Query("""
    SELECT DISTINCT c
    FROM Course c
    JOIN CourseAssignment ca
        ON ca.course.id = c.id
    WHERE ca.teacher.id = :teacherId
      AND ca.schoolClass.id = :classId
      AND ca.assignmentStatus = 'ACTIVE'
      AND ca.isDeleted = false
      AND c.isDeleted = false
    """)
    List<Course> findAllByTeacherIdAndSchoolClassId(@Param("teacherId") UUID teacherId, @Param("classId") UUID classId);

    @Query("""
    SELECT c
    FROM Course c
    WHERE NOT EXISTS (
        SELECT ca
        FROM CourseAssignment ca
        WHERE ca.course.id = c.id
          AND ca.schoolClass.id = :classId
          AND ca.isDeleted = false
          AND ca.assignmentStatus = 'ACTIVE'
    )
    AND c.isDeleted = false
    AND c.courseLevel = ( SELECT cl.classLevel FROM SchoolClass cl WHERE cl.id = :classId
    )
""")
    List<Course> findAllCoursesNotYetAssign(UUID classId);

    long countAllByIsDeleted(Boolean isDeleted);

    long countAllByCourseLevelAndIsDeleted(ESchoolLevel courseLevel, Boolean isDeleted);
}
