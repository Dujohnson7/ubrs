package com.ubrs.ubrs_backend.controller.schoolBalance;

import com.ubrs.ubrs_backend.domain.dto.schoolBalance.SchoolBalanceResponseDto;
import com.ubrs.ubrs_backend.service.schoolBalance.ISchoolBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schoolBalance")
public class SchoolBalanceController {

    private final ISchoolBalanceService  schoolBalanceService;

    @GetMapping
    public ResponseEntity<?> getSchoolExpenseById() {
        try {
            SchoolBalanceResponseDto schoolBalance = schoolBalanceService.getSchoolBalance();
            return ResponseEntity.ok(schoolBalance);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
