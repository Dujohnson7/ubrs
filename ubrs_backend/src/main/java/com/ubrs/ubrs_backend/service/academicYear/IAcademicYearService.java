package com.ubrs.ubrs_backend.service.academicYear;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearRequestDto;
import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;

import java.util.List;
import java.util.UUID;

public interface IAcademicYearService {
    AcademicYearResponseDto getAcademicYearById(UUID id);
    AcademicYearResponseDto saveAcademicYear(AcademicYearRequestDto academicYearRequestDto);
    AcademicYearResponseDto updateAcademicYear(UUID academicYearId, AcademicYearRequestDto academicYearRequestDto);
    void deleteAcademicYearById(UUID id);
    void activateAcademicYear(UUID academicId);
    void completeAcademicYear(UUID academicId);
    AcademicYearResponseDto getActiveAcademicYear();
    List<AcademicYearResponseDto> getAllAcademicYears();
    long totalAcademicYears();
}
