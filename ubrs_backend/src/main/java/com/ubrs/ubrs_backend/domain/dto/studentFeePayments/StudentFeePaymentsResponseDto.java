package com.ubrs.ubrs_backend.domain.dto.studentFeePayments;

import com.ubrs.ubrs_backend.domain.dto.schoolFees.SchoolFeesResponseDto;
import com.ubrs.ubrs_backend.util.EPaymentState;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class StudentFeePaymentsResponseDto {
    private UUID studentFeePaymentsId;
    private UUID studentId;
    private String studentCode;
    private String studentName;
    private SchoolFeesResponseDto schoolFees;
    private ESchoolLevel studentLevel;
    private Double totalAmountPaid;
    private Double remainAmount;
    private double overDueAmount;
    private EPaymentState paymentStatus;
    private Boolean isOverDueBeUsed;
    private List<StudentFeePaymentsDetailResponseDto> studentFeePaymentsDetails;
}
