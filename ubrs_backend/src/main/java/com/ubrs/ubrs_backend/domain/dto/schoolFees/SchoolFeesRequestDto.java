package com.ubrs.ubrs_backend.domain.dto.schoolFees;


import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class SchoolFeesRequestDto {
    private UUID academicYearId;
    private Double nurseryFees;
    private Double primaryFees;
}
