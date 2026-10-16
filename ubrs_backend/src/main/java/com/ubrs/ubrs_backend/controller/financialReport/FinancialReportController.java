package com.ubrs.ubrs_backend.controller.financialReport;

import com.ubrs.ubrs_backend.domain.projection.financialReport.ExpenseReportProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.SchoolFinancialSummaryProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentFeeCollectionProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.service.financialReport.IFinancialReportService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/financialPayments")
public class FinancialReportController {

    private final IFinancialReportService financialReportService;

    @GetMapping("/expense-report")
    public List<ExpenseReportProjection> getExpenseReport(
            @RequestParam(required = false) UUID schoolExpenseId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return financialReportService.getExpenseReport(schoolExpenseId, fromDate, toDate);
    }

    @GetMapping("/student-payment-history")
    public List<StudentPaymentHistoryProjection> getStudentPaymentHistory(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) ETerm term,
            @RequestParam(required = false) ESchoolLevel studentLevel,
            @RequestParam(required = false) UUID schoolClassId,
            @RequestParam(required = false) UUID schoolFeesId
    ) {
        return financialReportService.getStudentPaymentHistory(studentId, academicYearId, term, studentLevel, schoolClassId, schoolFeesId);
    }

    @GetMapping("/student-fee-collection")
    public List<StudentFeeCollectionProjection> getStudentFeeCollectionReport(@RequestParam UUID academicYearId, @RequestParam(required = false) ETerm term) {
        return financialReportService.getStudentFeeCollectionReport(academicYearId, term);
    }

    @GetMapping("/school-financial-summary")
    public List<SchoolFinancialSummaryProjection> getSchoolFinancialSummary(@RequestParam UUID academicYearId, @RequestParam(required = false) ETerm term) {
        return financialReportService.getSchoolFinancialSummary(academicYearId, term);
    }
}