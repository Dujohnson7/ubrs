package com.ubrs.ubrs_backend.service.studentFeePayment;

import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsDetailRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.projection.ParentStudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import org.springframework.data.jpa.repository.Query;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IStudentFeePaymentService {
    StudentFeePaymentsResponseDto getStudentFeePayments(UUID studentFeePaymentsId);
    StudentFeePaymentsResponseDto saveStudentFeePayments(StudentFeePaymentsRequestDto requestDto);
    StudentFeePaymentsResponseDto repayStudentFeePayments(UUID studentFeePaymentsId, StudentFeePaymentsDetailRequestDto requestDto);
    StudentFeePaymentsResponseDto updateStudentFeePayments(UUID studentFeePaymentsId, StudentFeePaymentsRequestDto requestDto);
    void importStudentFeePayments(UUID schoolFeesId, ETerm term, MultipartFile file);
    void deleteStudentFeePayments(UUID studentFeePaymentsId);
    void validateStudentFeePayments(UUID schoolFeesId, ETerm term);
    List<StudentFeePaymentsResponseDto> getAllStudentFeePayments();
    List<StudentFeePaymentsResponseDto> getAllStudentFeePaymentsByStudentId(UUID studentId);
    double totalAmountCollectedByActive();
    double totalAmountPendingReceivableByActive();
    double totalAmountExpectedByActive();
    long totalStudentPaid(ETerm term);
    long totalStudentPartial(ETerm term);
    long totalStudentUnpaid(ETerm term);
    double schoolFeeCompletionRate(ETerm term);
    List<ParentStudentPaymentHistoryProjection> getParentStudentPaymentHistory(UUID parentId, UUID academicYearId, ETerm term);
    boolean isStudentPayFees(UUID studentId, UUID academicId , ETerm term);

}
