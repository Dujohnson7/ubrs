package com.ubrs.ubrs_backend.service.schoolBalance;

import com.ubrs.ubrs_backend.domain.dto.schoolBalance.SchoolBalanceResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolBalance;
import com.ubrs.ubrs_backend.domain.mapper.SchoolBalanceMapper;
import com.ubrs.ubrs_backend.repository.ISchoolBalanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class SchoolBalanceServiceImpl implements ISchoolBalanceService {

    private final ISchoolBalanceRepository schoolBalanceRepository;
    private final SchoolBalanceMapper  schoolBalanceMapper;


    @Override
    public SchoolBalanceResponseDto getSchoolBalance() {
        SchoolBalance foundBalance = schoolBalanceRepository.findFirstBy().orElse(null);
        return schoolBalanceMapper.toSchoolBalanceDto(foundBalance);
    }


    @Override
    public void creditBalance(double amount) {

        SchoolBalance schoolBalance = schoolBalanceRepository.findFirstBy().orElse(null);

        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        if (schoolBalance == null) {
            schoolBalance = new SchoolBalance();
            schoolBalance.setBalance(amount);
        } else {
            schoolBalance.setBalance(schoolBalance.getBalance() + amount);
        }

        SchoolBalance savedBalance = schoolBalanceRepository.save(schoolBalance);

    }


    @Override
    public void debitBalance(double amount) {

        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        SchoolBalance existsBalance = schoolBalanceRepository.findFirstBy().orElseThrow(() -> new RuntimeException("School balance not found"));

        if (existsBalance.getBalance() < amount) {
            throw new RuntimeException("Insufficient Balance");
        }

        double newBalance = existsBalance.getBalance() - amount;
        existsBalance.setBalance(newBalance);

        SchoolBalance savedBalance = schoolBalanceRepository.save(existsBalance);

    }
}
