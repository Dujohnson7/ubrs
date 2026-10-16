package com.ubrs.ubrs_backend.domain.dto.schoolExpense;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SchoolExpenseResponseDto {
    private UUID schoolExpenseId;
    private String expenseName;
    private boolean expenseStaus;
}
