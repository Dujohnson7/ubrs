package com.ubrs.ubrs_backend.service.schoolExpense;

import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolExpense;
import com.ubrs.ubrs_backend.domain.mapper.SchoolExpenseMapper;
import com.ubrs.ubrs_backend.repository.ISchoolExpenseRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SchoolExpenseServiceImpl implements ISchoolExpenseService {

    private final ISchoolExpenseRepository schoolExpenseRepository;
    private final SchoolExpenseMapper  schoolExpenseMapper;

    @Override
    public SchoolExpenseResponseDto getSchoolExpenseById(UUID expenseId) {
        SchoolExpense existsExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(expenseId, false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));
        return schoolExpenseMapper.toSchoolExpenseDto(existsExpense);
    }

    @Override
    public SchoolExpenseResponseDto saveSchoolExpense(SchoolExpenseRequestDto requestDto) {
        SchoolExpense schoolExpense = new SchoolExpense();

        if (schoolExpenseRepository.existsByExpenseNameIgnoreCaseAndIsDeleted(requestDto.getExpenseName(), false)) {
            throw new RuntimeException("SchoolExpense already exists");
        }

        schoolExpense.setExpenseName(requestDto.getExpenseName());
        return schoolExpenseMapper.toSchoolExpenseDto(schoolExpenseRepository.save(schoolExpense));
    }

    @Override
    public SchoolExpenseResponseDto updateSchoolExpense(UUID expenseId, SchoolExpenseRequestDto requestDto) {
        SchoolExpense existsExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(expenseId, false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));

        existsExpense.setExpenseName(requestDto.getExpenseName());
        return schoolExpenseMapper.toSchoolExpenseDto(schoolExpenseRepository.save(existsExpense));
    }

    @Override
    public void deleteSchoolExpense(UUID expenseId) {
        SchoolExpense existsExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(expenseId, false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));

        existsExpense.setIsDeleted(true);
        schoolExpenseRepository.save(existsExpense);
    }

    @Override
    public void activateSchoolExpense(UUID expenseId) {
        SchoolExpense existsExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(expenseId, false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));

        if (existsExpense.isExpenseStaus()){
            throw new RuntimeException("SchoolExpense already activated");
        }

        existsExpense.setExpenseStaus(true);
        schoolExpenseRepository.save(existsExpense);
    }

    @Override
    public void deactivateSchoolExpense(UUID expenseId) {
        SchoolExpense existsExpense = schoolExpenseRepository.findSchoolExpenseByIdAndIsDeleted(expenseId, false)
                .orElseThrow(() -> new RuntimeException("SchoolExpense not found"));

        if (!existsExpense.isExpenseStaus()){
            throw new RuntimeException("SchoolExpense already deactivated");
        }

        existsExpense.setExpenseStaus(false);
        schoolExpenseRepository.save(existsExpense);
    }

    @Override
    public List<SchoolExpenseResponseDto> getAllSchoolExpense() {
        List<SchoolExpense> schoolExpenses = schoolExpenseRepository.findAllByIsDeleted(false);
        return schoolExpenseMapper.toSchoolExpenseDtoList(schoolExpenses);
    }

    @Override
    public List<SchoolExpenseResponseDto> getAllActiveSchoolExpense() {
        List<SchoolExpense> schoolExpenses = schoolExpenseRepository.findAllByExpenseStausAndIsDeleted(true, false);
        return schoolExpenseMapper.toSchoolExpenseDtoList(schoolExpenses);
    }

    @Override
    public long countAllActiveExpense() {
        return schoolExpenseRepository.countAllByExpenseStausAndIsDeleted(true, false);
    }
}
