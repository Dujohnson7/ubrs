package com.ubrs.ubrs_backend.domain.dto.otherIncome;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class OtherIncomeResponseDto {
    private UUID otherIncomeId;
    private double amount;
    private String description;
    private LocalDate incomeDate;
}
