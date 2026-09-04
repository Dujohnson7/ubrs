package com.ubrs.ubrs_backend.domain.dto.academicYear;

import com.ubrs.ubrs_backend.util.EAcademicState;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AcademicYearRequestDto {
    private String fiscalYear;
    private EAcademicState eAcademicStatus;
}