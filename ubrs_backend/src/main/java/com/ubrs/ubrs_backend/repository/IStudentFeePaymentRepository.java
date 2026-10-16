package com.ubrs.ubrs_backend.repository;


import com.ubrs.ubrs_backend.domain.entity.StudentFeePayments;
import com.ubrs.ubrs_backend.domain.projection.ParentStudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IStudentFeePaymentRepository extends JpaRepository<StudentFeePayments, UUID> {
    Optional<StudentFeePayments> findStudentFeePaymentsByIdAndIsDeleted(UUID id, Boolean isDeleted);

    List<StudentFeePayments> findAllByIsDeleted(Boolean isDeleted);
    
    List<StudentFeePayments> findAllByStudent_IdAndIsDeleted(UUID studentId, Boolean isDeleted);

    List<StudentFeePayments> findAllBySchoolFees_AcademicYear_IdAndIsDeleted(UUID schoolFeesAcademicYearId, Boolean isDeleted);

    List<StudentFeePayments> findAllBySchoolFees_AcademicYear_IdAndTermAndIsDeleted(UUID schoolFeesAcademicYearId, ETerm term, Boolean isDeleted);

    List<StudentFeePayments> findAllByStudentLevelAndIsDeleted(ESchoolLevel studentLevel, Boolean isDeleted);

    @Query("SELECT sfp FROM StudentFeePayments sfp WHERE sfp.student.id = :studentId AND sfp.isOverDueBeUsed = false AND sfp.overDueAmount > 0.0 AND sfp.isDeleted = false ")
    StudentFeePayments findByOverDueAmountAndStudent(UUID studentId);

    boolean existsByStudent_IdAndSchoolFees_IdAndTermAndIsDeleted(UUID studentId, UUID schoolFeesId, ETerm term, Boolean isDeleted);

    StudentFeePayments findByStudent_IdAndSchoolFees_IdAndTermAndIsDeleted(UUID studentId, UUID schoolFeesId, ETerm term, Boolean isDeleted);

    @Query("SELECT COALESCE( SUM(sf.totalAmountPaid), 0) FROM StudentFeePayments sf WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE'")
    double totalAmountCollectedByActive();

    @Query("SELECT COALESCE( SUM(sf.remainAmount), 0) FROM StudentFeePayments sf WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE'")
    double totalAmountPendingReceivableByActive();

    @Query("SELECT COALESCE( SUM(sf.remainAmount + sf.totalAmountPaid), 0) FROM StudentFeePayments sf WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE'")
    double totalAmountExpectedByActive();

    @Query("SELECT COALESCE( COUNT(sf) ,0) FROM StudentFeePayments sf  WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE' AND sf.paymentStatus = 'PAID' AND sf.term = :term")
    double totalStudentPaid(ETerm term);

    @Query("SELECT COALESCE( COUNT(sf) ,0) FROM StudentFeePayments sf  WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE' AND sf.paymentStatus = 'PARTIAL' AND sf.term = :term")
    double totalStudentPartial(ETerm term);

    @Query("SELECT COALESCE( COUNT(sf) ,0) FROM StudentFeePayments sf  WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE' AND sf.paymentStatus = 'UNPAID' AND sf.term = :term")
    double totalStudentUnpaid(ETerm term);

    @Query("SELECT COALESCE( COUNT(sf) ,0) FROM StudentFeePayments sf  WHERE sf.isDeleted = false AND sf.schoolFees.academicYear.academicYearStatus = 'ACTIVE' AND sf.term = :term")
    int countValidatedStudentByActive(ETerm term);

    @Query("""
    SELECT
        s.id AS studentId,
        s.studentCode AS studentCode,
        s.firstName AS firstName,
        s.lastName AS lastName,
        sf.id AS schoolFeesId,
        sf.academicYear.fiscalYear AS fiscalYear,
        p.term AS term,
        COALESCE(p.totalAmountPaid, 0.0) AS totalAmountPaid,
        COALESCE(p.remainAmount, 0.0) AS remainAmount,
        p.paymentStatus AS paymentStatus
    FROM ParentStudent ps
    JOIN ps.student s
    JOIN StudentFeePayments p ON p.student = s
    JOIN p.schoolFees sf
    WHERE ps.parent.id = :parentId
      AND (:academicYearId IS NULL OR sf.academicYear.id = :academicYearId)
      AND (:term IS NULL OR p.term = :term)
    ORDER BY s.firstName, s.lastName, sf.academicYear.fiscalYear, p.term
    """)
    List<ParentStudentPaymentHistoryProjection> findParentStudentPaymentHistory(UUID parentId, UUID academicYearId, ETerm term);
}
