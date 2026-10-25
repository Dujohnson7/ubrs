package com.ubrs.ubrs_backend.service.otherIncome;

import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeResponseDto;
import com.ubrs.ubrs_backend.domain.entity.OtherIncome;
import com.ubrs.ubrs_backend.domain.mapper.OtherIncomeMapper;
import com.ubrs.ubrs_backend.repository.IOtherIncomeRepository;
import com.ubrs.ubrs_backend.service.schoolBalance.ISchoolBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class OtherIncomeServiceImpl implements IOtherIncomeService {

    private final IOtherIncomeRepository  otherIncomeRepository;
    private final OtherIncomeMapper otherIncomeMapper;
    private final ISchoolBalanceService schoolBalanceService;

    @Override
    public OtherIncomeResponseDto getOtherIncome(UUID id) {
        OtherIncome otherIncome = otherIncomeRepository.findOtherIncomeByIdAndIsDeleted(id, false).orElseThrow(()-> new RuntimeException("Income Not Found"));
        return otherIncomeMapper.toOtherIncomeDto(otherIncome);
    }

    @Override
    public OtherIncomeResponseDto saveOtherIncome(OtherIncomeRequestDto requestDto) {
        OtherIncome otherIncome = new OtherIncome();

        if (requestDto.getAmount() < 0){
            throw new RuntimeException("Amount must be greater than zero");
        }

        otherIncome.setAmount(requestDto.getAmount());
        otherIncome.setDescription(requestDto.getDescription());
        otherIncome.setIncomeDate(requestDto.getIncomeDate());

        schoolBalanceService.creditBalance(requestDto.getAmount());
        return otherIncomeMapper.toOtherIncomeDto(otherIncomeRepository.save(otherIncome));
    }

    @Override
    public OtherIncomeResponseDto updateOtherIncome(UUID id, OtherIncomeRequestDto requestDto) {
        OtherIncome existOtherIncome = otherIncomeRepository.findOtherIncomeByIdAndIsDeleted(id, false).orElseThrow(()-> new RuntimeException("Income Not Found"));

        double previousPaidAmount =  existOtherIncome.getAmount();
        double newPaidAmount = requestDto.getAmount();

        double balanceDifference = newPaidAmount - previousPaidAmount;

        if (balanceDifference > 0) {
            schoolBalanceService.creditBalance(balanceDifference);
        } else if (balanceDifference < 0) {
            schoolBalanceService.debitBalance(Math.abs(balanceDifference));
        }

        existOtherIncome.setAmount(newPaidAmount);
        existOtherIncome.setDescription(requestDto.getDescription());
        existOtherIncome.setIncomeDate(requestDto.getIncomeDate());

        return otherIncomeMapper.toOtherIncomeDto(otherIncomeRepository.save(existOtherIncome));
    }

    @Override
    public void deleteOtherIncome(UUID id) {
        OtherIncome existOtherIncome = otherIncomeRepository.findOtherIncomeByIdAndIsDeleted(id, false).orElseThrow(()-> new RuntimeException("Income Not Found"));

        existOtherIncome.setIsDeleted(true);
        schoolBalanceService.debitBalance(existOtherIncome.getAmount());
        otherIncomeRepository.save(existOtherIncome);
    }

    @Override
    public List<OtherIncomeResponseDto> getAllOtherIncomes() {
        List<OtherIncome> otherIncomesList = otherIncomeRepository.findAllByIsDeleted(false);
        return otherIncomeMapper.toOtherIncomeDtoList(otherIncomesList);
    }
}
