package com.ubrs.ubrs_backend.service.schoolExpense;

import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseResponseDto;

import java.util.List;
import java.util.UUID;

public interface ISchoolExpenseService {
    SchoolExpenseResponseDto getSchoolExpenseById(UUID expenseId);
    SchoolExpenseResponseDto saveSchoolExpense(SchoolExpenseRequestDto requestDto);
    SchoolExpenseResponseDto updateSchoolExpense(UUID expenseId, SchoolExpenseRequestDto requestDto);
    void deleteSchoolExpense(UUID expenseId);
    void activateSchoolExpense(UUID expenseId);
    void deactivateSchoolExpense(UUID expenseId);
    List<SchoolExpenseResponseDto> getAllSchoolExpense();
    List<SchoolExpenseResponseDto> getAllActiveSchoolExpense();
    long countAllActiveExpense();
}
