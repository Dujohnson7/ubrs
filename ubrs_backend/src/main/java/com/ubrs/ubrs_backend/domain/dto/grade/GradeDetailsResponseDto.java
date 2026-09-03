package com.ubrs.ubrs_backend.domain.dto.grade;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class GradeDetailsResponse {

    private UUID id;

    private UUID gradeId;

    private UUID studentId;

    private String studentCode;

    private String studentName;

    private BigDecimal mark;
}