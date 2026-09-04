package com.ubrs.ubrs_backend.domain.projection.dashboard;

import java.util.UUID;

public interface GradeDistributionProjection {
    UUID getClassId();
    String getClassName();
    String getSchoolLevel();
    Long getA1();
    Long getB2();
    Long getB3();
    Long getC4();
    Long getD();
    Long getTotal();
    String getTerm();
    String getYear();
}
