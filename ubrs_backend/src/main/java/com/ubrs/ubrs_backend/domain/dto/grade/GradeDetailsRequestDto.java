package com.ubrs.ubrs_backend.domain.dto.grade;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class GradeDetailsRequestDto {

    private UUID studentId;

    private BigDecimal mark;
}
