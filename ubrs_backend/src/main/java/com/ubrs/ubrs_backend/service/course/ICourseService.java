package com.ubrs.ubrs_backend.service.course;

import com.ubrs.ubrs_backend.domain.dto.course.CourseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.course.CourseResponseDto;
import com.ubrs.ubrs_backend.util.ESchoolLevel;

import java.util.List;
import java.util.UUID;

public interface ICourseService {
    CourseResponseDto getCourseById(UUID courseId);
    CourseResponseDto saveCourse(CourseRequestDto courseRequestDto);
    CourseResponseDto updateCourse(UUID courseId, CourseRequestDto courseRequestDto);
    void deleteCourse(UUID courseId);
    List<CourseResponseDto> getAllCourses();
    List<CourseResponseDto> getAllCoursesBySchoolLevel(ESchoolLevel schoolLevel);
    List<CourseResponseDto> getAllCoursesByTeacher(UUID teacherId);
    List<CourseResponseDto> getAllCoursesByTeacherAndSchoolClass(UUID teacherId, UUID schoolClassId);
    List<CourseResponseDto> getAllCoursesByClass(UUID classId);
    List<CourseResponseDto> getAllCoursesNotYetAssign(UUID classId);
    long totalCourses();
    long totalCourseBySchoolLevel(ESchoolLevel schoolLevel);
}
