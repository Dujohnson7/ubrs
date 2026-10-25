package com.ubrs.ubrs_backend.service.otherIncome;

import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeResponseDto;

import java.util.List;
import java.util.UUID;

public interface IOtherIncomeService {
    OtherIncomeResponseDto getOtherIncome(UUID id);
    OtherIncomeResponseDto saveOtherIncome(OtherIncomeRequestDto requestDto);
    OtherIncomeResponseDto updateOtherIncome(UUID id, OtherIncomeRequestDto requestDto);
    void deleteOtherIncome(UUID id);
    List<OtherIncomeResponseDto> getAllOtherIncomes();
}
