package com.ubrs.ubrs_backend.service.expensesPayments;

import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsResponseDto;

import java.util.List;
import java.util.UUID;

public interface IExpensesPaymentsService {
    ExpensesPaymentsResponseDto getExpensesPayment(UUID expensePaymentId);
    ExpensesPaymentsResponseDto saveExpensesPayment(ExpensesPaymentsRequestDto requestDto);
    ExpensesPaymentsResponseDto updateExpensesPayment(UUID expensePaymentId ,ExpensesPaymentsRequestDto requestDto);
    void deleteExpensesPayment(UUID expensePaymentId);
    List<ExpensesPaymentsResponseDto> getAllExpensesPayments();
    List<ExpensesPaymentsResponseDto> getAllExpensesPaymentsByExpenseId(UUID expenseId);
}
