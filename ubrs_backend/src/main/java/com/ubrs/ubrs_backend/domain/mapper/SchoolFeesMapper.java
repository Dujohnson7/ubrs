package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolFees;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AcademicYearMapper.class},unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SchoolFeesMapper {
    @Mapping(source = "id", target = "schoolFeesId")
    @Mapping(source = "academicYear.id", target = "academicYearId")
    @Mapping(source = "academicYear.fiscalYear", target = "fiscalYear")
    SchoolFeesResponseDto toSchoolFeesDto(SchoolFees schoolFees);

    //@Mapping(source = "schoolFeesId", target = "id")
    //@Mapping(source = "academicYearId", target = "academicYear.id")
    //@Mapping(source = "fiscalYear", target = "academicYear.fiscalYear")
    SchoolFees toSchoolFeesEntity(SchoolFeesRequestDto schoolFeesRequestDto);

    List<SchoolFeesResponseDto> toSchoolFeesDtoList(List<SchoolFees> schoolFees);
}
