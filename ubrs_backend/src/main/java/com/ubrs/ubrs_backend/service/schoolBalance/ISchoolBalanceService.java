package com.ubrs.ubrs_backend.service.schoolBalance;

import com.ubrs.ubrs_backend.domain.dto.schoolBalance.SchoolBalanceResponseDto;

public interface ISchoolBalanceService {
    SchoolBalanceResponseDto getSchoolBalance();
    void creditBalance(double amount);
    void debitBalance(double amount);
}
