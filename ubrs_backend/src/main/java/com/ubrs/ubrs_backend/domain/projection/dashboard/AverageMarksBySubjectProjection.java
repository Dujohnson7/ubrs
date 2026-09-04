package com.ubrs.ubrs_backend.domain.projection.dashboard;

import java.math.BigDecimal;
import java.util.UUID;

public interface AverageMarksBySubjectProjection {
    UUID getCourseId();
    String getSubject();
    String getSchoolLevel();
    BigDecimal getAvgScore();
    Long getEnrolled();
    String getTerm();
    String getYear();
}
