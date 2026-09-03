package com.ubrs.ubrs_backend.domain.dto.grade;

import com.ubrs.ubrs_backend.util.EGradeState;
import com.ubrs.ubrs_backend.util.ETerm;
import com.ubrs.ubrs_backend.util.GradeType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class GradeResponse {

    private UUID id;

    private UUID academicYearId;

    private String fiscalYear;

    private ETerm term;

    private UUID schoolClassId;

    private String schoolClassName;

    private UUID courseId;

    private String courseName;

    private GradeType gradeType;

    private BigDecimal maxMark;

    private EGradeState submitStatus;

    private UUID approvedBy;

    private String approvedByName;

    private UUID rejectedBy;

    private String rejectedByName;

    private String feedback;
}