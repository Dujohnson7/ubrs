package com.ubrs.ubrs_backend.service.courseAssignment;

import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentResponseDto;
import com.ubrs.ubrs_backend.util.EAssignmentState;

import java.util.List;
import java.util.UUID;

public interface ICourseAssignmentService {
    CourseAssignmentResponseDto getCourseAssignmentById(UUID courseAssignmentId);
    CourseAssignmentResponseDto saveCourseAssignment(CourseAssignmentRequestDto courseAssignmentRequestDto);
    CourseAssignmentResponseDto updateCourseAssignment(UUID courseAssignmentId, CourseAssignmentRequestDto courseAssignmentRequestDto);
    void deleteCourseAssignment(UUID courseAssignmentId);
    void closeCourseAssignment(UUID courseAssignmentId);
    List<CourseAssignmentResponseDto> getAllCourseAssignments();
    List<CourseAssignmentResponseDto> getAllCourseAssignmentsByAssignmentStatus(EAssignmentState assignmentStatus);
    List<CourseAssignmentResponseDto> getAllCourseAssignmentsByTeacher(UUID teacherId);
    long totalCourseByTeacher(UUID teacherId);
}
