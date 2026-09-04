package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.grade.GradeDetailsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeDetailsResponseDto;
import com.ubrs.ubrs_backend.domain.entity.GradeDetails;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GradeDetailsMapper {

    @Mapping(source = "id", target = "gradeDetailsId")
    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "student.studentCode", target = "studentCode")
    @Mapping(
            expression = "java(gradeDetails.getStudent().getFirstName() + \" \" + gradeDetails.getStudent().getLastName())",
            target = "studentName"
    )
    GradeDetailsResponseDto toGradeDetailsDto(GradeDetails gradeDetails);

    @Mapping(source = "studentId", target = "student.id")
    GradeDetails toGradeDetailsEntity(GradeDetailsRequestDto requestDto);
}
