package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.ExpensesPayments;
import com.ubrs.ubrs_backend.domain.projection.financialReport.ExpenseReportProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.SchoolFinancialSummaryProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentFeeCollectionProjection;
import com.ubrs.ubrs_backend.domain.projection.financialReport.StudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface IFinancialReportRepository extends JpaRepository<ExpensesPayments, UUID> {

    @Query("""
        SELECT
            ep.id AS id,
            se.expenseName AS expenseName,
            ep.expenseDate AS expenseDate,
            ep.amount AS amount
        FROM ExpensesPayments ep
        JOIN ep.schoolExpense se
        WHERE (:schoolExpenseId IS NULL OR se.id = :schoolExpenseId)
          AND (:fromDate IS NULL OR ep.expenseDate >= :fromDate)
          AND (:toDate IS NULL OR ep.expenseDate <= :toDate)
        ORDER BY ep.expenseDate DESC
        """)
    List<ExpenseReportProjection> findExpenseReport(
            @Param("schoolExpenseId") UUID schoolExpenseId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );


    @Query("""
        SELECT
            d.id AS paymentDetailId,
            s.id AS studentId,
            s.studentCode AS studentCode,
            s.firstName AS firstName,
            s.lastName AS lastName,
            ay.id AS academicYearId,
            ay.fiscalYear AS fiscalYear,
            p.term AS term,
            p.studentLevel AS studentLevel,
            sc.id AS schoolClassId,
            sf.id AS schoolFeesId,
            d.amountPaid AS amountPaid,
            d.paidDate AS paidDate,
            d.overpaymentAmountToUse AS overpaymentAmountToUse
        FROM StudentFeePaymentsDetail d
        JOIN d.studentFeePayments p
        JOIN p.student s
        JOIN p.schoolFees sf
        JOIN sf.academicYear ay
        LEFT JOIN s.schoolClass sc
        WHERE (:studentId IS NULL OR s.id = :studentId)
          AND (:academicYearId IS NULL OR ay.id = :academicYearId)
          AND (:term IS NULL OR p.term = :term)
          AND (:studentLevel IS NULL OR p.studentLevel = :studentLevel)
          AND (:schoolClassId IS NULL OR sc.id = :schoolClassId)
          AND (:schoolFeesId IS NULL OR sf.id = :schoolFeesId)
        ORDER BY d.paidDate DESC
        """)
    List<StudentPaymentHistoryProjection> findStudentPaymentHistory(
            @Param("studentId") UUID studentId,
            @Param("academicYearId") UUID academicYearId,
            @Param("term") ETerm term,
            @Param("studentLevel") ESchoolLevel studentLevel,
            @Param("schoolClassId") UUID schoolClassId,
            @Param("schoolFeesId") UUID schoolFeesId
    );


    @Query("""
        SELECT
            ay.id AS academicYearId,
            ay.fiscalYear AS fiscalYear,
            p.term AS term,
            COUNT(DISTINCT p.student.id) AS studentCount,
            SUM(COALESCE(p.totalAmountPaid, 0.0)) AS totalAmountPaid,
            SUM(COALESCE(p.remainAmount, 0.0)) AS totalOutstanding,
            SUM(p.overDueAmount) AS totalOverdue
        FROM StudentFeePayments p
        JOIN p.schoolFees sf
        JOIN sf.academicYear ay
        WHERE ay.id = :academicYearId
          AND (:term IS NULL OR p.term = :term)
        GROUP BY ay.id, ay.fiscalYear, p.term
        ORDER BY p.term
        """)
    List<StudentFeeCollectionProjection> findStudentFeeCollectionReport(
            @Param("academicYearId") UUID academicYearId,
            @Param("term") ETerm term
    );

    @Query("""
    SELECT
        ay.id AS academicYearId,
        ay.fiscalYear AS fiscalYear,
        p.term AS term,
        COUNT(DISTINCT p.student.id) AS studentCount,
        SUM(COALESCE(p.totalAmountPaid, 0.0)) AS totalFeesCollected,
        SUM(COALESCE(p.remainAmount, 0.0)) AS totalOutstanding,
        SUM(p.overDueAmount) AS totalOverdue
    FROM StudentFeePayments p
    JOIN p.schoolFees sf
    JOIN sf.academicYear ay
    WHERE ay.id = :academicYearId
      AND (:term IS NULL OR p.term = :term)
    GROUP BY ay.id, ay.fiscalYear, p.term
    ORDER BY p.term
    """)
    List<SchoolFinancialSummaryProjection> findSchoolFinancialSummary(
            @Param("academicYearId") UUID academicYearId,
            @Param("term") ETerm term
    );

}