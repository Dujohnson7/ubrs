package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.grade.GradeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeResponseDto;
import com.ubrs.ubrs_backend.domain.entity.Grade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {GradeDetailsMapper.class},unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GradeMapper {

    @Mapping(source = "id", target = "gradeId")
    @Mapping(source = "academicYear.id", target = "academicYearId")
    @Mapping(source = "academicYear.fiscalYear", target = "fiscalYear")
    @Mapping(source = "schoolClass.id", target = "schoolClassId")
    @Mapping(source = "schoolClass.name", target = "schoolClassName")
    @Mapping(source = "schoolClass.classLevel", target = "classLevel")
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "course.courseCode", target = "courseCode")
    @Mapping(source = "course.courseName", target = "courseName")
    GradeResponseDto toGradeDto(Grade grade);

    @Mapping(source = "academicYearId", target = "academicYear.id")
    @Mapping(source = "schoolClassId", target = "schoolClass.id")
    @Mapping(source = "courseId", target = "course.id")
    Grade toGradeEntity(GradeRequestDto gradeRequestDto);

    List<GradeResponseDto> toGradeDtoList(List<Grade> grades);

}
