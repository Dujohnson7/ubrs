package com.ubrs.ubrs_backend.domain.projection.schoolReport;

import java.math.BigDecimal;
import java.util.UUID;

public interface PromotionRetentionProjection {

    UUID getClassId();

    String getClassName();

    UUID getAcademicYearId();

    String getAcademicYear();

    Long getTotalStudents();

    Long getPromoted();

    Long getRepeated();

    Long getTransferred();

    BigDecimal getPromotionRate();
}
