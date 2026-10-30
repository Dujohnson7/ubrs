package com.ubrs.ubrs_backend.domain.projection.studentReport;

import com.ubrs.ubrs_backend.util.ETerm;

import java.math.BigDecimal;
import java.util.UUID;

public interface MidTermReportProjection {

    UUID getStudentId();

    String getStudentCode();

    String getStudentName();

    UUID getCourseId();

    String getCourseCode();

    String getCourseName();

    ETerm getTerm();

    BigDecimal getMidTermMark();

    BigDecimal getMidTermMaxMark();

}
