package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolClass.SchoolClassResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SchoolClassMapper {
    @Mapping(source = "id", target = "schoolClassId")
    @Mapping(source = "classTeacher.id", target = "classTeacherId")
    @Mapping(source = "classTeacher.names", target = "classTeacherName")
    SchoolClassResponseDto toSchoolClassDto(SchoolClass schoolClass);

    //@Mapping(source = "schoolClassId", target = "id")
    @Mapping(source = "classTeacherId", target = "classTeacher.id")
    SchoolClass toSchoolClassEntity(SchoolClassRequestDto schoolClassRequestDto);

    List<SchoolClassResponseDto> toSchoolClassDtoList(List<SchoolClass> schoolClass);
}
