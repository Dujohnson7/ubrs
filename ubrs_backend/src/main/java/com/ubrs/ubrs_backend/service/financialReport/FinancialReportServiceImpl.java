package com.ubrs.ubrs_backend.service.financialReport;

import com.ubrs.ubrs_backend.domain.projection.financialReport.ExpenseReportProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.SchoolFinancialSummaryProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentFeeCollectionProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.repository.IFinancialReportRepository;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class FinancialReportServiceImpl implements IFinancialReportService {

    private final IFinancialReportRepository financialReportRepository;

    @Override
    public List<ExpenseReportProjection> getExpenseReport(UUID schoolExpenseId, LocalDate fromDate, LocalDate toDate) {
        return financialReportRepository.findExpenseReport(schoolExpenseId, fromDate, toDate);
    }

    @Override
    public List<StudentPaymentHistoryProjection> getStudentPaymentHistory(UUID studentId, UUID academicYearId, ETerm term, ESchoolLevel studentLevel, UUID schoolClassId, UUID schoolFeesId) {
        return financialReportRepository.findStudentPaymentHistory(studentId, academicYearId, term, studentLevel, schoolClassId, schoolFeesId);
    }

    @Override
    public List<StudentFeeCollectionProjection> getStudentFeeCollectionReport(UUID academicYearId, ETerm term) {
        return financialReportRepository.findStudentFeeCollectionReport(academicYearId, term);
    }

    @Override
    public List<SchoolFinancialSummaryProjection> getSchoolFinancialSummary(UUID academicYearId, ETerm term) {
        return financialReportRepository.findSchoolFinancialSummary(academicYearId, term);
    }
}
