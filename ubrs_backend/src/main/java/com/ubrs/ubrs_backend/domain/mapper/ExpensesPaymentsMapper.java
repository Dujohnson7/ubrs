package com.ubrs.ubrs_backend.domain.mapper;

import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.entity.ExpensesPayments;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ExpensesPaymentsMapper {

    @Mapping(source = "id", target = "expensesPaymentsId")
    @Mapping(source = "schoolExpense.id", target = "schoolExpenseId")
    @Mapping(source = "schoolExpense.expenseName", target = "expenseName")
    ExpensesPaymentsResponseDto toExpensesPaymentsDto(ExpensesPayments expensesPayments);

    //@Mapping(source = "expensesPaymentsId", target = "id")
    //@Mapping(source = "schoolExpenseId", target = "schoolExpense.id")
    ExpensesPayments toExpensesPaymentsEntity(ExpensesPaymentsRequestDto expensesPaymentsRequestDto);

    List<ExpensesPaymentsResponseDto> toExpensesPaymentsDtoList(List<ExpensesPayments> expensesPayments);
}
