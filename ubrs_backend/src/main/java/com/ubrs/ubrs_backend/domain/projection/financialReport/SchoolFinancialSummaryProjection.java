package com.ubrs.ubrs_backend.domain.projection.financialReport;

import com.ubrs.ubrs_backend.util.ETerm;

import java.util.UUID;

public interface SchoolFinancialSummaryProjection {
    UUID getAcademicYearId();
    String getFiscalYear();
    ETerm getTerm();

    Long getStudentCount();
    Double getTotalFeesCollected();
    Double getTotalOutstanding();
    Double getTotalOverdue();
}