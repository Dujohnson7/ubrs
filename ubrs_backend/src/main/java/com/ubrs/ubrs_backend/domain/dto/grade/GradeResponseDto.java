package com.ubrs.ubrs_backend.domain.dto.grade;

import com.ubrs.ubrs_backend.util.EGradeState;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import com.ubrs.ubrs_backend.util.GradeType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class GradeResponseDto {

    private UUID gradeId;

    private UUID academicYearId;

    private String fiscalYear;

    private ETerm term;

    private UUID schoolClassId;

    private String schoolClassName;

    private ESchoolLevel classLevel;

    private UUID courseId;

    private String courseCode;

    private String courseName;

    private GradeType gradeType;

    private BigDecimal maxMark;

    private EGradeState submitStatus;

    //private String approvedBy;

    //private String rejectedBy;

    private String feedback;

    private List<GradeDetailsResponseDto> gradeDetails;

}