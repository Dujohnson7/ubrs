package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.course.CourseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.course.CourseResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CourseMapper {
    @Mapping(source = "id", target = "courseId")
    CourseResponseDto toCourseDto(Course course);

    //@Mapping(source = "courseId", target = "id")
    Course toCourseEntity(CourseRequestDto courseRequestDto);

    List<CourseResponseDto> toCourseDtoList(List<Course> courses);
}
