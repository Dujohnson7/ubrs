package com.ubrs.ubrs_backend.domain.dto.academicYear;

import com.ubrs.ubrs_backend.util.EAcademicState;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class AcademicYearResponseDto {
    private UUID academicYearId;
    private String fiscalYear;
    private EAcademicState academicYearStatus;
}
