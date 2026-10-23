package com.ubrs.ubrs_backend.controller.studentFeePayment;
 
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsDetailRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.projection.ParentStudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.service.studentFeePayment.IStudentFeePaymentService;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studentFeePayment")
public class StudentFeePaymentController {

    private final IStudentFeePaymentService studentFeePaymentService;

    @GetMapping("/all")
    public ResponseEntity<List<StudentFeePaymentsResponseDto>> getAllStudentFeePayments(){
        try {
            List<StudentFeePaymentsResponseDto> studentFeePaymentDtoList = studentFeePaymentService.getAllStudentFeePayments();
            if (Objects.nonNull(studentFeePaymentDtoList)) {
                return ResponseEntity.ok(studentFeePaymentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/{studentFeePaymentId}")
    public ResponseEntity<?> getStudentFeePaymentsById(@PathVariable String studentFeePaymentId) {
        try {
            StudentFeePaymentsResponseDto studentFeePaymentDto = studentFeePaymentService.getStudentFeePayments(UUID.fromString(studentFeePaymentId));
            return ResponseEntity.ok(studentFeePaymentDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStudentFeePayments(@RequestBody StudentFeePaymentsRequestDto studentFeePaymentDto) {
        try {
            StudentFeePaymentsResponseDto studentFeePayment =  studentFeePaymentService.saveStudentFeePayments(studentFeePaymentDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(studentFeePayment);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/repayStudentFeePayments/{studentFeePaymentsId}")
    public ResponseEntity<?> repayStudentFeePayments(@PathVariable String studentFeePaymentsId, @RequestBody StudentFeePaymentsDetailRequestDto requestDto) {
        try {
            StudentFeePaymentsResponseDto studentFeePayment =  studentFeePaymentService.repayStudentFeePayments(UUID.fromString(studentFeePaymentsId), requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(studentFeePayment);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PatchMapping("/validateStudentFeePayments/{schoolFeesId}")
    public ResponseEntity<?> validateStudentFeePayments(@PathVariable String schoolFeesId, @RequestParam ETerm term) {
        try {
            studentFeePaymentService.validateStudentFeePayments(UUID.fromString(schoolFeesId), term);
            return ResponseEntity.ok().body("School Fees has been validated Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @PostMapping({"/import/{schoolFeesId}", "/import"})
    public ResponseEntity<?> importStudentFeePayments(
            @RequestParam("file") MultipartFile file,
            @PathVariable(value = "schoolFeesId", required = false) String schoolFeesIdPath,
            @RequestParam(value = "schoolFeesId", required = false) String schoolFeesIdParam,
            @RequestParam("term") ETerm term) {
        String schoolFeesId = schoolFeesIdPath != null ? schoolFeesIdPath : schoolFeesIdParam;
        if (schoolFeesId == null) {
            return ResponseEntity.badRequest().body("schoolFeesId is required");
        }
        try {
            studentFeePaymentService.importStudentFeePayments(UUID.fromString(schoolFeesId), term, file);
            return ResponseEntity.ok("Students Fee Payments Import Successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{studentFeePaymentId}")
    public ResponseEntity<?> updateStudentFeePayments(@RequestBody StudentFeePaymentsRequestDto studentFeePaymentDto, @PathVariable String studentFeePaymentId) {
        try {
            StudentFeePaymentsResponseDto studentFeePayment =  studentFeePaymentService.updateStudentFeePayments(UUID.fromString(studentFeePaymentId), studentFeePaymentDto);
            return ResponseEntity.ok(studentFeePayment);
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/delete/{studentFeePaymentId}")
    public ResponseEntity<?> deleteStudentFeePayments(@PathVariable String studentFeePaymentId) {
        try {
            studentFeePaymentService.deleteStudentFeePayments(UUID.fromString(studentFeePaymentId));
            return ResponseEntity.ok().body("School Fees has been delete Successful");
        } catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


    @GetMapping("/isStudentPayFees/{studentId}")
        public ResponseEntity<Boolean> isStudentPayFees(@PathVariable String studentId, @RequestParam ETerm term, @RequestParam String academicYearId) {
        try {
            boolean respond =  studentFeePaymentService.isStudentPayFees(UUID.fromString(studentId), UUID.fromString(academicYearId), term);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentFeePaymentsResponseDto>> getAllStudentFeePaymentsByStudentId(@PathVariable String studentId){
        try {
            List<StudentFeePaymentsResponseDto> studentFeePaymentDtoList = studentFeePaymentService.getAllStudentFeePaymentsByStudentId(UUID.fromString(studentId));
            if (Objects.nonNull(studentFeePaymentDtoList)) {
                return ResponseEntity.ok(studentFeePaymentDtoList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
            }
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @GetMapping("/parent-student-payment-history")
    public List<ParentStudentPaymentHistoryProjection> getParentStudentPaymentHistory(
            @RequestParam UUID parentId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) ETerm term
    ) {
        return studentFeePaymentService.getParentStudentPaymentHistory(parentId, academicYearId, term);
    }

}
