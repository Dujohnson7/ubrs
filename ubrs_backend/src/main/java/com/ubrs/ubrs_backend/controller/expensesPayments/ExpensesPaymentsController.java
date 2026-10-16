package com.ubrs.ubrs_backend.controller.expensesPayments;

import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.expensesPayments.ExpensesPaymentsResponseDto;
import com.ubrs.ubrs_backend.service.expensesPayments.IExpensesPaymentsService;
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
@RequestMapping("/api/expensePayments")
public class ExpensesPaymentsController {

    private final IExpensesPaymentsService expensesPaymentsService;

    @GetMapping("/all")
    public ResponseEntity<List<ExpensesPaymentsResponseDto>> getAllExpensesPayments(){
        try {
            List<ExpensesPaymentsResponseDto> expensesPaymentsDtoList = expensesPaymentsService.getAllExpensesPayments();
            if (Objects.nonNull(expensesPaymentsDtoList)) {
                return ResponseEntity.ok(expensesPaymentsDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<List<ExpensesPaymentsResponseDto>> getAllExpensesPayments(@PathVariable String expenseId){
        try {
            List<ExpensesPaymentsResponseDto> expensesPaymentsDtoList = expensesPaymentsService.getAllExpensesPaymentsByExpenseId(UUID.fromString(expenseId));
            if (Objects.nonNull(expensesPaymentsDtoList)) {
                return ResponseEntity.ok(expensesPaymentsDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{expensesPaymentsId}")
    public ResponseEntity<?> getExpensesPaymentsById(@PathVariable String expensesPaymentsId) {
        try {
            ExpensesPaymentsResponseDto expensesPaymentsDto = expensesPaymentsService.getExpensesPayment(UUID.fromString(expensesPaymentsId));
            return ResponseEntity.ok(expensesPaymentsDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerExpensesPayments(@RequestBody ExpensesPaymentsRequestDto expensesPaymentsDto) {
        try {
            ExpensesPaymentsResponseDto expensesPayments =  expensesPaymentsService.saveExpensesPayment(expensesPaymentsDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(expensesPayments);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update/{expensesPaymentsId}")
    public ResponseEntity<?> updateExpensesPayments(@RequestBody ExpensesPaymentsRequestDto expensesPaymentsDto, @PathVariable String expensesPaymentsId) {
        try {
            ExpensesPaymentsResponseDto expensesPayments =  expensesPaymentsService.updateExpensesPayment(UUID.fromString(expensesPaymentsId), expensesPaymentsDto);
            return ResponseEntity.ok(expensesPayments);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{expensesPaymentsId}")
    public ResponseEntity<?> deleteExpensesPayments(@PathVariable String expensesPaymentsId) {
        try {
            expensesPaymentsService.deleteExpensesPayment(UUID.fromString(expensesPaymentsId));
            return ResponseEntity.ok().body("Expense Payment has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
