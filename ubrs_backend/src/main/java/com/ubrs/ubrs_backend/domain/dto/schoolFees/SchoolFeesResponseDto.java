package com.ubrs.ubrs_backend.domain.dto.schoolFees;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class SchoolFeesResponseDto {
    private UUID schoolFeesId;
    private UUID academicYearId;
    private String fiscalYear;
    private Double nurseryFees;
    private Double primaryFees;
}
