package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearRequestDto;
import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.entity.AcademicYear;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AcademicYearMapper {
    @Mapping(source = "id", target = "academicYearId")
    AcademicYearResponseDto toAcademicYearDto(AcademicYear academicYear);

    //@Mapping(source = "academicYearId", target = "id")
    AcademicYear toAcademicYearEntity(AcademicYearRequestDto academicYearRequestDto);

    List<AcademicYearResponseDto> toAcademicYearDtoList(List<AcademicYear> academicYears);
}
