package com.ubrs.ubrs_backend.domain.dto.studentFeePayments;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class StudentFeePaymentsDetailResponseDto {
    private UUID studentFeePaymentsDetailId;
    private UUID studentFeePaymentsId;
    private Double amountPaid;
    private LocalDate paidDate;
}
