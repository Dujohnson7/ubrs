package com.ubrs.ubrs_backend.domain.projection.schoolReport;

import java.math.BigDecimal;
import java.util.UUID;

public interface ClassPerformanceProjection {

    UUID getClassId();

    String getClassName();

    Long getStudents();

    BigDecimal getAvgScore();

    BigDecimal getPassingRate();

    Long getFailing();

    String getTopGrade();

    String getTerm();

    String getYear();
}
