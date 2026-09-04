package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.courseAssignment.CourseAssignmentResponseDto;
import com.ubrs.ubrs_backend.domain.entity.CourseAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CourseAssignmentMapper {
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "id", target = "courseAssignmentId")
    @Mapping(source = "course.courseName", target = "courseName")
    @Mapping(source = "schoolClass.id", target = "schoolClassId")
    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(source = "schoolClass.name", target = "schoolClassName")
    @Mapping(source = "teacher.names", target = "teacherName")
    CourseAssignmentResponseDto toCourseAssignmentDto(CourseAssignment courseAssignment);

    //@Mapping(source = "courseAssignmentId", target = "id")
    @Mapping(source = "courseId", target = "course.id")
    @Mapping(source = "schoolClassId", target = "schoolClass.id")
    @Mapping(source = "teacherId", target = "teacher.id")
    CourseAssignment toCourseAssignmentEntity(CourseAssignmentRequestDto courseAssignmentRequestDto);

    List<CourseAssignmentResponseDto> toCourseAssignmentDtoList(List<CourseAssignment> courseAssignment);
}
