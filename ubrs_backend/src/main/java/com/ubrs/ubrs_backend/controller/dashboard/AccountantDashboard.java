package com.ubrs.ubrs_backend.controller.dashboard;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
import com.ubrs.ubrs_backend.service.schoolExpense.ISchoolExpenseService;
import com.ubrs.ubrs_backend.service.student.IStudentService;
import com.ubrs.ubrs_backend.service.studentFeePayment.IStudentFeePaymentService;
import com.ubrs.ubrs_backend.service.users.IUsersService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/AccountantDashboard")
public class AccountantDashboard {

    private final IStudentService studentService;
    private final IUsersService usersService;
    private final IAcademicYearService academicYearService;
    private final ISchoolExpenseService schoolExpenseService;
    private final IStudentFeePaymentService studentFeePaymentService;


    @GetMapping("/totalStudents")
    public ResponseEntity<Long> getTotalStudent() {
        try {
            long respond = studentService.totalStudents();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalStudents/nursery")
    public ResponseEntity<Long> totalNurseryStudents() {
        try {
            long respond = studentService.totalStudentsBySchoolLevel(ESchoolLevel.NURSERY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalStudents/primary")
    public ResponseEntity<Long> totalPrimaryStudents() {
        try {
            long respond = studentService.totalStudentsBySchoolLevel(ESchoolLevel.PRIMARY);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalTeacher")
    public ResponseEntity<Long> getTotalTeacher() {
        try {
            long respond = usersService.totalTeacher();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/academicYear/active")
    public ResponseEntity<?> getAllActiveAcademicYears(){
        try {
            AcademicYearResponseDto academicYearDto = academicYearService.getActiveAcademicYear();
            return ResponseEntity.ok(academicYearDto);
        }  catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/totalSchoolExpense")
    public ResponseEntity<Long> totalSchoolExpense() {
        try {
            long respond = schoolExpenseService.countAllActiveExpense();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalAmountCollectedByActive")
    public ResponseEntity<Double> totalAmountCollectedByActive() {
        try {
            double respond = studentFeePaymentService.totalAmountCollectedByActive();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/totalAmountPendingReceivableByActive")
    public ResponseEntity<Double> totalAmountPendingReceivableByActive() {
        try {
            double respond = studentFeePaymentService.totalAmountPendingReceivableByActive();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/totalAmountExpectedByActive")
    public ResponseEntity<Double> totalAmountExpectedByActive() {
        try {
            double respond = studentFeePaymentService.totalAmountExpectedByActive();
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/totalStudentPaid")
    public ResponseEntity<Long> totalStudentPaid() {
        try {
            long respond = studentFeePaymentService.totalStudentPaid(ETerm.TERM1);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/totalStudentPartial")
    public ResponseEntity<Long> totalStudentPartial() {
        try {
            long respond = studentFeePaymentService.totalStudentPartial(ETerm.TERM1);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/totalStudentUnpaid")
    public ResponseEntity<Long> totalStudentUnpaid() {
        try {
            long respond = studentFeePaymentService.totalStudentUnpaid(ETerm.TERM1);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/schoolFeeCompletionRate")
    public ResponseEntity<Double> schoolFeeCompletionRate() {
        try {
            double respond = studentFeePaymentService.schoolFeeCompletionRate(ETerm.TERM1);
            return ResponseEntity.ok(respond);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}
