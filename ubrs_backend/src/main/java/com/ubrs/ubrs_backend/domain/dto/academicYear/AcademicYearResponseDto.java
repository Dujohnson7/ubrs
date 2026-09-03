package com.ubrs.ubrs_backend.domain.dto.academicYear;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class AcademicYearResponse {

    private UUID id;
    private String fiscalYear;
}
