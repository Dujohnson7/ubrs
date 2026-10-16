package com.ubrs.ubrs_backend.controller.schoolExpense;

import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseRequestDto;
import com.ubrs.ubrs_backend.domain.dto.schoolExpense.SchoolExpenseResponseDto;
import com.ubrs.ubrs_backend.service.schoolExpense.ISchoolExpenseService;
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
@RequestMapping("/api/schoolExpense")
public class SchoolExpenseController {

    private final ISchoolExpenseService schoolExpenseService;

    @GetMapping("/all")
    public ResponseEntity<List<SchoolExpenseResponseDto>> getAllSchoolExpense(){
        try {
            List<SchoolExpenseResponseDto> schoolExpenseDtoList = schoolExpenseService.getAllSchoolExpense();
            if (Objects.nonNull(schoolExpenseDtoList)) {
                return ResponseEntity.ok(schoolExpenseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/all/active")
    public ResponseEntity<List<SchoolExpenseResponseDto>> getAllActiveSchoolExpense(){
        try {
            List<SchoolExpenseResponseDto> schoolExpenseDtoList = schoolExpenseService.getAllActiveSchoolExpense();
            if (Objects.nonNull(schoolExpenseDtoList)) {
                return ResponseEntity.ok(schoolExpenseDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{schoolExpenseId}")
    public ResponseEntity<?> getSchoolExpenseById(@PathVariable String schoolExpenseId) {
        try {
            SchoolExpenseResponseDto schoolExpenseDto = schoolExpenseService.getSchoolExpenseById(UUID.fromString(schoolExpenseId));
            return ResponseEntity.ok(schoolExpenseDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSchoolExpense(@RequestBody SchoolExpenseRequestDto schoolExpenseDto) {
        try {
            SchoolExpenseResponseDto schoolExpense =  schoolExpenseService.saveSchoolExpense(schoolExpenseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(schoolExpense);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{schoolExpenseId}")
    public ResponseEntity<?> updateSchoolExpense(@RequestBody SchoolExpenseRequestDto schoolExpenseDto, @PathVariable String schoolExpenseId) {
        try {
            SchoolExpenseResponseDto schoolExpense =  schoolExpenseService.updateSchoolExpense(UUID.fromString(schoolExpenseId), schoolExpenseDto);
            return ResponseEntity.ok(schoolExpense);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{schoolExpenseId}")
    public ResponseEntity<?> deleteSchoolExpense(@PathVariable String schoolExpenseId) {
        try {
            schoolExpenseService.deleteSchoolExpense(UUID.fromString(schoolExpenseId));
            return ResponseEntity.ok().body("School Expense has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PatchMapping("/active/{schoolExpenseId}")
    public ResponseEntity<?> activateSchoolExpense(@PathVariable String schoolExpenseId) {
        try {
            schoolExpenseService.activateSchoolExpense(UUID.fromString(schoolExpenseId));
            return ResponseEntity.ok().body("School Expense has been activate Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PatchMapping("/deactive/{schoolExpenseId}")
    public ResponseEntity<?> deactivateSchoolExpense(@PathVariable String schoolExpenseId) {
        try {
            schoolExpenseService.deactivateSchoolExpense(UUID.fromString(schoolExpenseId));
            return ResponseEntity.ok().body("School Expense has been deactivate Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
