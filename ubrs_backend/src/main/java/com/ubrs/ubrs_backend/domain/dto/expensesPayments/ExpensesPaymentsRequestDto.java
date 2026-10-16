package com.ubrs.ubrs_backend.domain.dto.expensesPayments;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class ExpensesPaymentsRequestDto {
    private UUID schoolExpenseId;
    private Double amount;
    private LocalDate expenseDate;
}
