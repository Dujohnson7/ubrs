package com.ubrs.ubrs_backend.service.expensesPayments;

import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.entity.ExpensesPayments;
import com.ubrs.ubrs_backend.domain.entity.SchoolBalance;
import com.ubrs.ubrs_backend.domain.entity.SchoolExpense;
import com.ubrs.ubrs_backend.domain.mapper.ExpensesPaymentsMapper;
import com.ubrs.ubrs_backend.repository.IExpensesPaymentsRepository;
import com.ubrs.ubrs_backend.repository.ISchoolExpenseRepository;
import com.ubrs.ubrs_backend.service.schoolBalance.ISchoolBalanceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ExpensesPaymentsServiceImpl implements IExpensesPaymentsService {

    private final IExpensesPaymentsRepository expensesPaymentsRepository;
    private final ISchoolExpenseRepository schoolExpenseRepository;
    private final ExpensesPaymentsMapper expensesPaymentsMapper;
    private final ISchoolBalanceService schoolBalanceService;


    @Override
    public ExpensesPaymentsResponseDto getExpensesPayment(UUID expensePaymentId) {
        ExpensesPayments payments = expensesPaymentsRepository.findExpensesPaymentsByIdAndIsDeleted(expensePaymentId, false)
                .orElseThrow(() -> new RuntimeException("Expenses Payment Not Found"));
        return expensesPaymentsMapper.toExpensesPaymentsDto(payments);
    }

    @Override
    public ExpensesPaymentsResponseDto saveExpensesPayment(ExpensesPaymentsRequestDto requestDto) {

        SchoolExpense schoolExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(requestDto.getSchoolExpenseId(), false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));

        ExpensesPayments payments = new ExpensesPayments();

        payments.setSchoolExpense(schoolExpense);
        payments.setExpenseDate(LocalDate.now());
        payments.setAmount(requestDto.getAmount());

        schoolBalanceService.debitBalance(requestDto.getAmount());

        return expensesPaymentsMapper.toExpensesPaymentsDto(expensesPaymentsRepository.save(payments));
    }


    @Override
    public ExpensesPaymentsResponseDto updateExpensesPayment(UUID expensePaymentId, ExpensesPaymentsRequestDto requestDto) {

        ExpensesPayments existsPayment = expensesPaymentsRepository
                .findExpensesPaymentsByIdAndIsDeleted(expensePaymentId, false)
                .orElseThrow(() -> new RuntimeException("Expenses Payment Not Found"));

        double oldAmount = existsPayment.getAmount() != null ? existsPayment.getAmount() : 0.0;

        double newAmount = requestDto.getAmount() != null ? requestDto.getAmount() : 0.0;

        if (newAmount <= 0) {
            throw new RuntimeException("Expense payment amount must be greater than zero");
        }

        double difference = newAmount - oldAmount;

        if (difference > 0) {
            schoolBalanceService.debitBalance(difference);
        } else if (difference < 0) {
            schoolBalanceService.creditBalance(-difference);
        }

        existsPayment.setAmount(newAmount);
        existsPayment.setExpenseDate(requestDto.getExpenseDate());

        ExpensesPayments updatedPayment = expensesPaymentsRepository.save(existsPayment);
        return expensesPaymentsMapper.toExpensesPaymentsDto(updatedPayment);
    }


    @Override
    public void deleteExpensesPayment(UUID expensePaymentId) {
        ExpensesPayments existsPayment = expensesPaymentsRepository.findExpensesPaymentsByIdAndIsDeleted(expensePaymentId, false)
                .orElseThrow(() -> new RuntimeException("Expenses Payment Not Found"));

        schoolBalanceService.creditBalance(existsPayment.getAmount());
        existsPayment.setIsDeleted(true);
        expensesPaymentsRepository.save(existsPayment);
    }

    @Override
    public List<ExpensesPaymentsResponseDto> getAllExpensesPayments() {
        List<ExpensesPayments> expensesPaymentsList = expensesPaymentsRepository.findAllByIsDeleted(false);
        return expensesPaymentsMapper.toExpensesPaymentsDtoList(expensesPaymentsList);
    }

    @Override
    public List<ExpensesPaymentsResponseDto> getAllExpensesPaymentsByExpenseId(UUID expenseId) {
        List<ExpensesPayments> expensesPaymentsList = expensesPaymentsRepository.findAllBySchoolExpense_IdAndIsDeleted(expenseId, false);
        return expensesPaymentsMapper.toExpensesPaymentsDtoList(expensesPaymentsList);
    }
}
