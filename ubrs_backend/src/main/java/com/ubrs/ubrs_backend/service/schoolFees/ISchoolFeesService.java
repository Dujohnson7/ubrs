package com.ubrs.ubrs_backend.service.schoolFees;

import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesResponseDto;

import java.util.List;
import java.util.UUID;

public interface ISchoolFeesService {
    SchoolFeesResponseDto getSchoolFees(UUID schoolFeesId);
    SchoolFeesResponseDto saveSchoolFees(SchoolFeesRequestDto feesRequestDto);
    SchoolFeesResponseDto updateSchoolFees(UUID schoolFeesId, SchoolFeesRequestDto feesRequestDto);
    void deleteSchoolFees(UUID schoolFeesId);
    List<SchoolFeesResponseDto> getAllSchoolFees();
}
