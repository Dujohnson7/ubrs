package com.ubrs.ubrs_backend.domain.dto.otherIncome;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class OtherIncomeRequestDto {
    private double amount;
    private String description;
    private LocalDate incomeDate;
}
