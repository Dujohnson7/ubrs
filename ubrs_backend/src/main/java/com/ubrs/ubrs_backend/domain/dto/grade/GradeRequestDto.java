package com.ubrs.ubrs_backend.domain.dto.grade;
 
import com.ubrs.ubrs_backend.util.ETerm;
import com.ubrs.ubrs_backend.util.GradeType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class GradeRequestDto {

    private UUID academicYearId;

    private ETerm term;

    private UUID schoolClassId;

    private UUID courseId;

    private GradeType gradeType;

    private BigDecimal maxMark;

    private String feedback;

    private List<GradeDetailsRequestDto> gradeDetails;
}