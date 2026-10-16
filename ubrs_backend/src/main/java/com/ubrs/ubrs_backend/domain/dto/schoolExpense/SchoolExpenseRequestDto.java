package com.ubrs.ubrs_backend.domain.dto.schoolExpense;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolExpenseRequestDto {
    private String expenseName;
    private boolean expenseStaus;
}
