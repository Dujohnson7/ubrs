package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.CourseAssignment;
import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.util.EAssignmentState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICourseAssignmentRepository  extends JpaRepository<CourseAssignment, UUID> {

    Optional<CourseAssignment> findCourseAssignmentByIdAndIsDeleted(UUID id, Boolean isDeleted);

    List<CourseAssignment> findAllByIsDeleted(Boolean isDeleted);

    List<CourseAssignment> findAllByAssignmentStatusAndIsDeleted(EAssignmentState assignmentStatus, Boolean isDeleted);

    List<CourseAssignment> findAllByTeacherIdAndIsDeleted(UUID teacherId, Boolean isDeleted);

    boolean existsByCourse_IdAndSchoolClass_IdAndAssignmentStatusAndIsDeleted(UUID courseId, UUID schoolClassId, EAssignmentState assignmentStatus, Boolean isDeleted);

    boolean existsByTeacher_IdAndCourse_IdAndSchoolClass_IdAndAssignmentStatusAndIsDeleted(UUID teacher, UUID courseId, UUID schoolClassId, EAssignmentState assignmentStatus, Boolean isDeleted);

    long countAllByTeacher_IdAndAssignmentStatusAndIsDeleted(UUID teacherId, EAssignmentState assignmentStatus, Boolean isDeleted);

    CourseAssignment findCourseAssignmentByCourse_IdAndAssignmentStatusAndIsDeleted(UUID courseId, EAssignmentState assignmentStatus, Boolean isDeleted);
}
