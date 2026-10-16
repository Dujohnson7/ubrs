package com.ubrs.ubrs_backend.domain.projection.financialReport;

import com.ubrs.ubrs_backend.util.ETerm;

import java.util.UUID;

public interface StudentFeeCollectionProjection {
    UUID getAcademicYearId();
    String getFiscalYear();
    ETerm getTerm();

    Long getStudentCount();
    Double getTotalAmountPaid();
    Double getTotalOutstanding();
    Double getTotalOverdue();
}