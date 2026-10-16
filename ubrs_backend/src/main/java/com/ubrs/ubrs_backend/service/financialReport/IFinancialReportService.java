package com.ubrs.ubrs_backend.service.financialReport;

import com.ubrs.ubrs_backend.domain.projection.financialReport.ExpenseReportProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.SchoolFinancialSummaryProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentFeeCollectionProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IFinancialReportService {

    List<ExpenseReportProjection> getExpenseReport(UUID schoolExpenseId, LocalDate fromDate, LocalDate toDate);

    List<StudentPaymentHistoryProjection> getStudentPaymentHistory(UUID studentId, UUID academicYearId, ETerm term, ESchoolLevel studentLevel, UUID schoolClassId, UUID schoolFeesId);

    List<StudentFeeCollectionProjection> getStudentFeeCollectionReport(UUID academicYearId, ETerm term);

    List<SchoolFinancialSummaryProjection> getSchoolFinancialSummary(UUID academicYearId, ETerm term);
}
