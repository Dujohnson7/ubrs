package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.parent.ParentStudentResponseDto;
import com.ubrs.ubrs_backend.domain.entity.ParentStudent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ParentStudentMapper {

    @Mapping(source = "id", target = "id")

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "parent.names", target = "parentName")
    @Mapping(source = "parent.email", target = "parentEmail")
    @Mapping(source = "parent.phone", target = "parentPhone")

    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "student.studentCode", target = "studentCode")
    @Mapping(source = "student.schoolClass.id", target = "schoolClassId")
    @Mapping(source = "student.schoolClass.name", target = "schoolClassName")
    @Mapping(source = "student.schoolClass.classLevel", target = "classLevel")

    @Mapping(
            target = "studentName",
            expression = "java("
                    + "entity.getStudent().getFirstName() + \" \" + "
                    + "(entity.getStudent().getMiddleName() != null "
                    + "? entity.getStudent().getMiddleName() + \" \" : \"\") + "
                    + "entity.getStudent().getLastName()"
                    + ")"
    )
    ParentStudentResponseDto toParentStudentDto(ParentStudent entity);

    List<ParentStudentResponseDto> toParentStudentDtoList(List<ParentStudent> parentStudents
    );
}