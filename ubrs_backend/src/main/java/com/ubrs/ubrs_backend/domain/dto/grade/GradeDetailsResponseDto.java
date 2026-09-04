package com.ubrs.ubrs_backend.domain.dto.grade;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class GradeDetailsResponseDto {

    private String gradeDetailsId;

    private String studentId;

    private String studentCode;

    private String studentName;

    private BigDecimal mark;

}