package com.ubrs.ubrs_backend.domain.projection.financialReport;

import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;

import java.time.LocalDate;
import java.util.UUID;

public interface StudentPaymentHistoryProjection {
    UUID getPaymentDetailId();
    UUID getStudentId();
    String getStudentCode();
    String getFirstName();
    String getLastName();

    UUID getAcademicYearId();
    String getFiscalYear();
    ETerm getTerm();
    ESchoolLevel getStudentLevel();

    UUID getSchoolClassId();
    UUID getSchoolFeesId();

    Double getAmountPaid();
    LocalDate getPaidDate();
    Double getOverpaymentAmountToUse();
}