package com.ubrs.ubrs_backend.domain.projection.schoolReport;

import com.ubrs.ubrs_backend.util.ETerm;

import java.math.BigDecimal;
import java.util.UUID;

public interface SubjectPerformanceProjection {

    UUID getCourseId();

    String getSubject();

    UUID getClassId();

    String getClassName();

    Long getEnrolled();

    BigDecimal getAvgScore();

    BigDecimal getPassRate();

    BigDecimal getHighest();

    BigDecimal getLowest();

    ETerm getTerm();

    String getYear();
}