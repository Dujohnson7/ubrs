package com.ubrs.ubrs_backend.controller.otherIncome;

import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.otherIncome.OtherIncomeResponseDto;
import com.ubrs.ubrs_backend.service.otherIncome.IOtherIncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/otherIncome")
public class OtherIncomeController {

    private final IOtherIncomeService otherIncomeService;

    @GetMapping("/all")
    public ResponseEntity<List<OtherIncomeResponseDto>> getAllOtherIncome(){
        try {
            List<OtherIncomeResponseDto> otherIncomeDtoList = otherIncomeService.getAllOtherIncomes();
            if (Objects.nonNull(otherIncomeDtoList)) {
                return ResponseEntity.ok(otherIncomeDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{otherIncomeId}")
    public ResponseEntity<?> getOtherIncomeById(@PathVariable String otherIncomeId) {
        try {
            OtherIncomeResponseDto otherIncomeDto = otherIncomeService.getOtherIncome(UUID.fromString(otherIncomeId));
            return ResponseEntity.ok(otherIncomeDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerOtherIncome(@RequestBody OtherIncomeRequestDto otherIncomeDto) {
        try {
            OtherIncomeResponseDto otherIncome =  otherIncomeService.saveOtherIncome(otherIncomeDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(otherIncome);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{otherIncomeId}")
    public ResponseEntity<?> updateOtherIncome(@RequestBody OtherIncomeRequestDto otherIncomeDto, @PathVariable String otherIncomeId) {
        try {
            OtherIncomeResponseDto otherIncome =  otherIncomeService.updateOtherIncome(UUID.fromString(otherIncomeId), otherIncomeDto);
            return ResponseEntity.ok(otherIncome);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{otherIncomeId}")
    public ResponseEntity<?> deleteOtherIncome(@PathVariable String otherIncomeId) {
        try {
            otherIncomeService.deleteOtherIncome(UUID.fromString(otherIncomeId));
            return ResponseEntity.ok().body("Income has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
