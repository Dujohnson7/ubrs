package com.ubrs.ubrs_backend.service.studentFeePayment;

import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsDetailRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.studentFeePayments.StudentFeePaymentsResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolFees;
import com.ubrs.ubrs_backend.domain.entity.Student;
import com.ubrs.ubrs_backend.domain.entity.StudentFeePayments;
import com.ubrs.ubrs_backend.domain.entity.StudentFeePaymentsDetail;
import com.ubrs.ubrs_backend.domain.mapper.StudentFeePaymentsMapper;
import com.ubrs.ubrs_backend.domain.projection.ParentStudentPaymentHistoryProjection;
import com.ubrs.ubrs_backend.repository.ISchoolFeesRepository;
import com.ubrs.ubrs_backend.repository.IStudentFeePaymentRepository;
import com.ubrs.ubrs_backend.repository.IStudentRepository;
import com.ubrs.ubrs_backend.service.schoolBalance.ISchoolBalanceService;
import com.ubrs.ubrs_backend.util.EPaymentState;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentFeePaymentServiceImpl implements IStudentFeePaymentService{

    private final IStudentFeePaymentRepository studentFeePaymentRepository;
    private final StudentFeePaymentsMapper studentFeePaymentsMapper;
    private final ISchoolBalanceService schoolBalanceService;
    private final ISchoolFeesRepository schoolFeesRepository;
    private final IStudentRepository  studentRepository;

    @Override
    public StudentFeePaymentsResponseDto getStudentFeePayments(UUID studentFeePaymentsId) {
        StudentFeePayments existingStudentFeePayments = studentFeePaymentRepository.findStudentFeePaymentsByIdAndIsDeleted(studentFeePaymentsId, false)
                .orElseThrow(()-> new RuntimeException("Student Fee Payment Not Found"));
        return studentFeePaymentsMapper.toStudentFeePaymentsDto(existingStudentFeePayments);
    }

    @Override
    @Transactional
    public StudentFeePaymentsResponseDto saveStudentFeePayments(StudentFeePaymentsRequestDto requestDto) {

        if (requestDto == null) {
            throw new RuntimeException("Student Fee Payment data is required");
        }

        SchoolFees schoolFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(requestDto.getSchoolFeesId(), false)
                .orElseThrow(() -> new RuntimeException("School Fee Not Found"));

        Student student = studentRepository.findStudentByIdAndIsDeleted(requestDto.getStudentId(), false)
                .orElseThrow(() -> new RuntimeException("Student Not Found"));

        if (requestDto.getTerm() == null) {
            throw new RuntimeException("Term is required");
        }

        StudentFeePayments feePayments = studentFeePaymentRepository
                        .findByStudent_IdAndSchoolFees_IdAndTermAndIsDeleted(student.getId(), schoolFees.getId(), requestDto.getTerm(), false);

        boolean isNewPayment = feePayments == null;

        if (feePayments != null && feePayments.getPaymentStatus() == EPaymentState.PAID){
            throw new RuntimeException("Student already pays this term");
        }

        if (isNewPayment) {
            feePayments = new StudentFeePayments();

            feePayments.setStudent(student);
            feePayments.setSchoolFees(schoolFees);
            feePayments.setTerm(requestDto.getTerm());
            feePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
            feePayments.setIsOverDueBeUsed(false);
        }

        double newPaymentAmount = 0.0;

        if (requestDto.getStudentFeePaymentsDetails() != null) {
            for (StudentFeePaymentsDetailRequestDto paymentDto : requestDto.getStudentFeePaymentsDetails()) {

                if (paymentDto == null || paymentDto.getAmountPaid() == null || paymentDto.getAmountPaid() <= 0) {
                    continue;
                }

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(paymentDto.getAmountPaid());

                detail.setPaidDate(paymentDto.getPaidDate() != null
                                ? paymentDto.getPaidDate()
                                : LocalDate.now());

                detail.setStudentFeePayments(feePayments);

                feePayments.getStudentFeePaymentsDetails().add(detail);

                newPaymentAmount += paymentDto.getAmountPaid();
            }
        }

        if (newPaymentAmount <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        schoolBalanceService.creditBalance(newPaymentAmount);

        double amountMustPayment = getAmountMustPayment(student, schoolFees);

        double previousOverpayment = getExtraStudentFeesAmount(student.getId());

        double totalPaidAmount = feePayments
                .getStudentFeePaymentsDetails()
                .stream()
                .filter(payment ->
                        payment != null && payment.getAmountPaid() != null)
                .mapToDouble(StudentFeePaymentsDetail::getAmountPaid)
                .sum();

        double effectivePaidAmount = totalPaidAmount + previousOverpayment;

        double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

        feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

        feePayments.setRemainAmount(remainAmount);

        feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

        feePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

        StudentFeePayments savedFeePayments = studentFeePaymentRepository.save(feePayments);

        return studentFeePaymentsMapper.toStudentFeePaymentsDto(savedFeePayments);
    }


    @Override
    @Transactional
    public StudentFeePaymentsResponseDto repayStudentFeePayments(UUID studentFeePaymentsId, StudentFeePaymentsDetailRequestDto requestDto) {

        if (studentFeePaymentsId == null) {
            throw new RuntimeException("Student Fee Payment ID is required");
        }

        if (requestDto == null) {
            throw new RuntimeException("Student Fee Payment data is required");
        }

        if (requestDto.getAmountPaid() == null || requestDto.getAmountPaid() <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        StudentFeePayments feePayments = studentFeePaymentRepository
                .findStudentFeePaymentsByIdAndIsDeleted(studentFeePaymentsId, false)
                .orElseThrow(() -> new RuntimeException("Student Fee Payment Not Found"));

        Student student = feePayments.getStudent();
        SchoolFees schoolFees = feePayments.getSchoolFees();

        if (student == null || schoolFees == null) {
            throw new RuntimeException("Student and School Fee are required");
        }

        StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();
        detail.setAmountPaid(requestDto.getAmountPaid());
        detail.setPaidDate(LocalDate.now());
        detail.setStudentFeePayments(feePayments);

        feePayments.getStudentFeePaymentsDetails().add(detail);

        schoolBalanceService.creditBalance(requestDto.getAmountPaid());

        double amountMustPayment = getAmountMustPayment(student, schoolFees);

        double previousOverpayment = getExtraStudentFeesAmount(student.getId());

        double totalPaidAmount = feePayments.getStudentFeePaymentsDetails()
                .stream()
                .filter(payment -> payment != null && payment.getAmountPaid() != null)
                .mapToDouble(StudentFeePaymentsDetail::getAmountPaid)
                .sum();

        double effectivePaidAmount = totalPaidAmount + previousOverpayment;

        double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

        feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

        feePayments.setRemainAmount(remainAmount);

        feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

        feePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

        StudentFeePayments savedFeePayments = studentFeePaymentRepository.save(feePayments);

        return studentFeePaymentsMapper.toStudentFeePaymentsDto(savedFeePayments);
    }

    @Override
    @Transactional
    public StudentFeePaymentsResponseDto updateStudentFeePayments(UUID studentFeePaymentsId, StudentFeePaymentsRequestDto requestDto) {

        if (requestDto == null) {
            throw new RuntimeException("Student Fee Payment data is required");
        }

        StudentFeePayments existingStudentFeePayments = studentFeePaymentRepository
                .findStudentFeePaymentsByIdAndIsDeleted(studentFeePaymentsId, false)
                .orElseThrow(() -> new RuntimeException("Student Fee Payment Not Found"));

        SchoolFees schoolFees = schoolFeesRepository
                .findSchoolFeesByIdAndIsDeleted(requestDto.getSchoolFeesId(), false)
                .orElseThrow(() -> new RuntimeException("School Fee Not Found"));

        Student student = studentRepository
                .findStudentByIdAndIsDeleted(requestDto.getStudentId(), false)
                .orElseThrow(() -> new RuntimeException("Student Not Found"));

        double previousPaidAmount =
                existingStudentFeePayments.getStudentFeePaymentsDetails()
                        .stream()
                        .filter(detail -> detail.getAmountPaid() != null)
                        .mapToDouble(StudentFeePaymentsDetail::getAmountPaid)
                        .sum();

        existingStudentFeePayments.setTerm(requestDto.getTerm());
        existingStudentFeePayments.setSchoolFees(schoolFees);
        existingStudentFeePayments.setStudent(student);
        existingStudentFeePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
        existingStudentFeePayments.setIsOverDueBeUsed(false);

        existingStudentFeePayments.getStudentFeePaymentsDetails().clear();

        double newPaidAmount = 0.0;

        if (requestDto.getStudentFeePaymentsDetails() != null) {
            for (StudentFeePaymentsDetailRequestDto paymentsDetail : requestDto.getStudentFeePaymentsDetails()) {

                if (paymentsDetail == null || paymentsDetail.getAmountPaid() == null || paymentsDetail.getAmountPaid() <= 0) {
                    continue;
                }

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(paymentsDetail.getAmountPaid());
                detail.setPaidDate(paymentsDetail.getPaidDate());
                detail.setStudentFeePayments(existingStudentFeePayments);

                existingStudentFeePayments.getStudentFeePaymentsDetails().add(detail);

                newPaidAmount += paymentsDetail.getAmountPaid();
            }
        }

        double balanceDifference = newPaidAmount - previousPaidAmount;

        if (balanceDifference > 0) {
            schoolBalanceService.creditBalance(balanceDifference);
        } else if (balanceDifference < 0) {
            schoolBalanceService.debitBalance(Math.abs(balanceDifference));
        }

        double amountMustPayment = getAmountMustPayment(student, schoolFees);

        double previousOverpayment = getExtraStudentFeesAmount(student.getId());

        double effectivePaidAmount = newPaidAmount + previousOverpayment;

        double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

        existingStudentFeePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

        existingStudentFeePayments.setRemainAmount(remainAmount);

        existingStudentFeePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

        existingStudentFeePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

        StudentFeePayments updatedFeePayments = studentFeePaymentRepository.save(existingStudentFeePayments);

        return studentFeePaymentsMapper.toStudentFeePaymentsDto(
                updatedFeePayments);
    }

    @Override
    @Transactional
    public void importStudentFeePayments(UUID schoolFeesId, ETerm term, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload an Excel file");
        }

        if (schoolFeesId == null) {
            throw new RuntimeException("School Fee is required");
        }

        if (term == null) {
            throw new RuntimeException("Term is required");
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            SchoolFees schoolFees = schoolFeesRepository
                    .findSchoolFeesByIdAndIsDeleted(schoolFeesId, false)
                    .orElseThrow(() -> new RuntimeException("School Fee Not Found"));

            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                throw new RuntimeException("Excel file does not contain a header row");
            }

            Map<String, Integer> columnIndexes = new HashMap<>();

            for (Cell cell : headerRow) {

                String header = formatter
                        .formatCellValue(cell)
                        .trim()
                        .toLowerCase()
                        .replace(" ", "")
                        .replace("_", "");

                if (!header.isBlank()) {
                    columnIndexes.put(header, cell.getColumnIndex());
                }
            }

            requireColumn(columnIndexes, "studentcode");
            requireColumn(columnIndexes, "amountpaid");
            //requireColumn(columnIndexes, "paiddate");

            Set<String> uploadedStudentCodes = new HashSet<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                String studentCode = getCellValue(row, columnIndexes, "studentcode", formatter);

                if (studentCode.isBlank()) {
                    continue;
                }

                if (!uploadedStudentCodes.add(studentCode)) {
                    throw new RuntimeException("Duplicate student code '" + studentCode + "' at Excel row " + (i + 1));
                }

                String amountPaidValue = getCellValue(row, columnIndexes, "amountpaid", formatter);

                String paidDateValue = getCellValue(row, columnIndexes, "paiddate", formatter);

                if (amountPaidValue.isBlank()) {
                    throw new RuntimeException("Amount paid is required at Excel row " + (i + 1));
                }

                if (paidDateValue.isBlank()) {
                    throw new RuntimeException("Paid date is required at Excel row " + (i + 1));
                }

                double amountPaid;

                try {
                    amountPaid = Double.parseDouble(amountPaidValue.trim());
                } catch (NumberFormatException ex) {
                    throw new RuntimeException("Invalid amount paid '" + amountPaidValue + "' at Excel row " + (i + 1));
                }

                if (amountPaid <= 0) {
                    throw new RuntimeException("Amount paid must be greater than 0 at Excel row " + (i + 1));
                }

                LocalDate paidDate;

                try {
                    paidDate = parseFlexibleDate(paidDateValue);
                } catch (Exception ex) {
                    throw new RuntimeException("Invalid paid date '" + paidDateValue + "' at Excel row " + (i + 1) + ". Supported formats: yyyy-MM-dd, M/d/yy, " + "M/d/yyyy, dd/MM/yyyy, dd-MM-yyyy");
                }

                final int finalI = i;

                Student student = studentRepository
                        .findStudentByStudentCodeAndIsDeleted(studentCode, false)
                        .orElseThrow(() -> new RuntimeException("Student with code '" + studentCode + "' Not Found at Excel row " + (finalI + 1)));



                StudentFeePayments feePayments = studentFeePaymentRepository.findByStudent_IdAndSchoolFees_IdAndTermAndIsDeleted(student.getId(), schoolFees.getId(), term, false);

                if (feePayments != null && feePayments.getPaymentStatus() == EPaymentState.PAID) {
                    continue;
                }

                if (feePayments == null) {

                    feePayments = new StudentFeePayments();

                    feePayments.setStudent(student);
                    feePayments.setSchoolFees(schoolFees);
                    feePayments.setTerm(term);
                    feePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
                    feePayments.setIsOverDueBeUsed(false);
                }

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(amountPaid);
                detail.setPaidDate(paidDate);
                detail.setStudentFeePayments(feePayments);

                feePayments.getStudentFeePaymentsDetails().add(detail);

                double totalPaidAmount = feePayments
                        .getStudentFeePaymentsDetails()
                        .stream()
                        .filter(payment ->
                                payment != null &&
                                        payment.getAmountPaid() != null)
                        .mapToDouble(StudentFeePaymentsDetail::getAmountPaid)
                        .sum();

                double amountMustPayment = getAmountMustPayment(student, schoolFees);

                double previousOverpayment = getExtraStudentFeesAmount(student.getId());

                double effectivePaidAmount = totalPaidAmount + previousOverpayment;

                double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

                feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

                feePayments.setRemainAmount(remainAmount);

                feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

                feePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

                studentFeePaymentRepository.save(feePayments);
                schoolBalanceService.creditBalance(amountPaid);
            }

        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new RuntimeException("Failed to import student fee payments. please try again");
        }
    }


    @Override
    public void deleteStudentFeePayments(UUID studentFeePaymentsId) {
        StudentFeePayments existingStudentFeePayments = studentFeePaymentRepository.findStudentFeePaymentsByIdAndIsDeleted(studentFeePaymentsId, false)
                .orElseThrow(()-> new RuntimeException("Student Fee Payment Not Found"));

        double debitAmount = existingStudentFeePayments.getTotalAmountPaid();

        studentFeePaymentRepository.delete(existingStudentFeePayments);

        schoolBalanceService.debitBalance(debitAmount);

    }


    @Override
    @Transactional
    public void validateStudentFeePayments(UUID schoolFeesId, ETerm term) {
        SchoolFees schoolFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(schoolFeesId, false)
                .orElseThrow(()-> new RuntimeException("School Fee Not Found"));

        List<Student> studentList = studentRepository.findAllByIsDeleted(false);

        for (Student student : studentList) {

            if (student.getSchoolClass() == null) {
                continue;
            }

            boolean alreadyExists = studentFeePaymentRepository.existsByStudent_IdAndSchoolFees_IdAndTermAndIsDeleted(student.getId(), schoolFeesId, term, false);

            if (alreadyExists) {
                continue;
            }

            StudentFeePayments feePayments = new StudentFeePayments();

            feePayments.setTerm(term);
            feePayments.setSchoolFees(schoolFees);
            feePayments.setStudent(student);
            feePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
            feePayments.setIsOverDueBeUsed(false);

            double totalPaidAmount = 0.0;

            double amountMustPayment = getAmountMustPayment(student, schoolFees);

            double previousOverpayment = getExtraStudentFeesAmount(student.getId());

            double effectivePaidAmount = totalPaidAmount + previousOverpayment;

            double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

            feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

            feePayments.setRemainAmount(remainAmount);

            feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

            feePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

            if (effectivePaidAmount > 0){

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(0.0);
                detail.setOverpaymentAmountToUse(previousOverpayment);
                detail.setPaidDate(LocalDate.now());
                detail.setStudentFeePayments(feePayments);

                feePayments.getStudentFeePaymentsDetails().add(detail);

            }

            studentFeePaymentRepository.save(feePayments);
        }
    }


    @Override
    public List<StudentFeePaymentsResponseDto> getAllStudentFeePayments() {
        List<StudentFeePayments> feePaymentsList = studentFeePaymentRepository.findAllByIsDeleted(false);
        return studentFeePaymentsMapper.toStudentFeePaymentsDtoList(feePaymentsList);
    }

    @Override
    public List<StudentFeePaymentsResponseDto> getAllStudentFeePaymentsByStudentId(UUID studentId) {
        List<StudentFeePayments> feePaymentsList = studentFeePaymentRepository.findAllByStudent_IdAndIsDeleted(studentId, false);
        return studentFeePaymentsMapper.toStudentFeePaymentsDtoList(feePaymentsList);
    }

    @Override
    public double totalAmountCollectedByActive() {
        return studentFeePaymentRepository.totalAmountCollectedByActive();
    }

    @Override
    public double totalAmountPendingReceivableByActive() {
        return studentFeePaymentRepository.totalAmountPendingReceivableByActive();
    }

    @Override
    public double totalAmountExpectedByActive() {
        return studentFeePaymentRepository.totalAmountExpectedByActive();
    }

    @Override
    public long totalStudentPaid(ETerm term) {
        return studentFeePaymentRepository.totalStudentPaid(term);
    }

    @Override
    public long totalStudentPartial(ETerm term) {
        return studentFeePaymentRepository.totalStudentPartial(term);
    }

    @Override
    public long totalStudentUnpaid(ETerm term) {
        return studentFeePaymentRepository.totalStudentUnpaid(term);
    }

    @Override
    public double schoolFeeCompletionRate(ETerm term) {
        return ( studentFeePaymentRepository.totalStudentPaid(term) / studentFeePaymentRepository.countValidatedStudentByActive(term) ) * 100;
    }

    @Override
    public List<ParentStudentPaymentHistoryProjection> getParentStudentPaymentHistory(UUID parentId, UUID academicYearId, ETerm term) {
        return studentFeePaymentRepository.findParentStudentPaymentHistory(parentId, academicYearId, term);
    }


    private double getStudentOverPaidAmount(double totalPaidAmount, double amountMustPayment) {
        return Math.max(0.0, totalPaidAmount - amountMustPayment);
    }

    private double getAmountMustPayment(Student student, SchoolFees schoolFees) {

        ESchoolLevel studentLevel = student.getSchoolClass().getClassLevel();

        return switch (studentLevel) {

            case PRIMARY -> schoolFees.getPrimaryFees();

            case NURSERY -> schoolFees.getNurseryFees();

            default -> 0;
        };
    }

    public double getRemainAmount(double totalPaidAmount, double amountMustPayment) {
        double remainAmount =   amountMustPayment - totalPaidAmount;
        return Math.max(0.0, remainAmount);
    }

    public EPaymentState getPaymentStatus(double remainAmount, double amountMustPayment) {

        if (remainAmount == 0) {
            return EPaymentState.PAID;
        } else if (remainAmount == amountMustPayment) {
            return EPaymentState.UNPAID;
        } else {
            return EPaymentState.PARTIAL;
        }
    }

    private double getExtraStudentFeesAmount(UUID studentId) {
        StudentFeePayments foundFees = studentFeePaymentRepository.findByOverDueAmountAndStudent(studentId);

        if (foundFees == null) {
            return 0.0;
        }

        double extraStudentFee = foundFees.getOverDueAmount();

        foundFees.setIsOverDueBeUsed(true);
        studentFeePaymentRepository.save(foundFees);

        return Math.max(0.0, extraStudentFee);
    }

    private void requireColumn(Map<String, Integer> columnIndexes, String columnName) {
        if (!columnIndexes.containsKey(columnName)) {
            throw new RuntimeException("Required Excel column '" + columnName + "' was not found");
        }
    }

    private String getCellValue(Row row, Map<String, Integer> columnIndexes, String columnName, DataFormatter formatter) {

        Integer columnIndex = columnIndexes.get(columnName);

        if (columnIndex == null) {
            return "";
        }

        Cell cell = row.getCell(columnIndex);

        if (cell == null) {
            return "";
        }

        return formatter.formatCellValue(cell).trim();
    }


    private LocalDate parseFlexibleDate(String dateValue) {

        if (dateValue == null || dateValue.trim().isEmpty()) {
            return null;
        }

        String value = dateValue.trim();

        List<DateTimeFormatter> formatters = Arrays.asList(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("M/d/yy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("d/M/yy"),
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("d-M-yy"),
                DateTimeFormatter.ofPattern("d-M-yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy")
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        throw new IllegalArgumentException("Unsupported date format");
    }


    /*

    @Override
    @Transactional
    public StudentFeePaymentsResponseDto saveStudentFeePayments(StudentFeePaymentsRequestDto requestDto) {

        if (requestDto == null) {
            throw new RuntimeException("Student Fee Payment data is required");
        }

        SchoolFees schoolFees = schoolFeesRepository.findSchoolFeesByIdAndIsDeleted(requestDto.getSchoolFeesId(), false)
                .orElseThrow(() -> new RuntimeException("School Fee Not Found"));

        Student student = studentRepository.findStudentByIdAndIsDeleted(requestDto.getStudentId(), false)
                .orElseThrow(() -> new RuntimeException("Student Not Found"));

        if (requestDto.getTerm() == null) {
            throw new RuntimeException("Term is required");
        }

        StudentFeePayments feePayments = new StudentFeePayments();

        feePayments.setTerm(requestDto.getTerm());
        feePayments.setSchoolFees(schoolFees);
        feePayments.setStudent(student);
        feePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
        feePayments.setIsOverDueBeUsed(false);

        double totalPaidAmount = 0.0;

        if (requestDto.getStudentFeePaymentsDetails() != null) {
            for (StudentFeePaymentsDetailRequestDto paymentsDetail : requestDto.getStudentFeePaymentsDetails()) {

                if (paymentsDetail == null || paymentsDetail.getAmountPaid() == null || paymentsDetail.getAmountPaid() <= 0) {
                    continue;
                }

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(paymentsDetail.getAmountPaid());
                detail.setPaidDate(paymentsDetail.getPaidDate());
                detail.setStudentFeePayments(feePayments);

                feePayments.getStudentFeePaymentsDetails().add(detail);
                totalPaidAmount += paymentsDetail.getAmountPaid();

                schoolBalanceService.creditBalance(paymentsDetail.getAmountPaid());
            }

        }

        double amountMustPayment = getAmountMustPayment(student, schoolFees);

        double previousOverpayment = getExtraStudentFeesAmount(student.getId());

        double effectivePaidAmount = totalPaidAmount + previousOverpayment;

        double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

        feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

        feePayments.setRemainAmount(remainAmount);

        feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));


        feePayments.setOverDueAmount(getStudentOverPaidAmount(effectivePaidAmount, amountMustPayment));

        StudentFeePayments savedFeePayments = studentFeePaymentRepository.save(feePayments);


        return studentFeePaymentsMapper.toStudentFeePaymentsDto(savedFeePayments);
    }


    @Override
    @Transactional
    public void importStudentFeePayments(UUID schoolFeesId, ETerm term, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload an Excel file");
        }

        if (schoolFeesId == null) {
            throw new RuntimeException("School Fee is required");
        }

        if (term == null) {
            throw new RuntimeException("Term is required");
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            SchoolFees schoolFees = schoolFeesRepository
                    .findSchoolFeesByIdAndIsDeleted(schoolFeesId, false)
                    .orElseThrow(() -> new RuntimeException("School Fee Not Found"));

            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                throw new RuntimeException("Excel file does not contain a header row");
            }

            Map<String, Integer> columnIndexes = new HashMap<>();

            for (Cell cell : headerRow) {

                String header = formatter
                        .formatCellValue(cell)
                        .trim()
                        .toLowerCase()
                        .replace(" ", "")
                        .replace("_", "");

                if (!header.isBlank()) {
                    columnIndexes.put(header, cell.getColumnIndex());
                }
            }

            requireColumn(columnIndexes, "studentcode");
            requireColumn(columnIndexes, "amountpaid");
            requireColumn(columnIndexes, "paiddate");

            Set<String> uploadedStudentCodes = new HashSet<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                String studentCode = getCellValue(row, columnIndexes, "studentcode", formatter);

                if (studentCode.isBlank()) {
                    continue;
                }

                if (!uploadedStudentCodes.add(studentCode)) {
                    throw new RuntimeException("Duplicate student code '" + studentCode + "' at Excel row " + (i + 1));
                }

                String amountPaidValue = getCellValue(row, columnIndexes, "amountpaid", formatter);

                String paidDateValue = getCellValue(row, columnIndexes, "paiddate", formatter);

                if (amountPaidValue.isBlank()) {
                    throw new RuntimeException("Amount paid is required at Excel row " + (i + 1));
                }

                if (paidDateValue.isBlank()) {
                    throw new RuntimeException("Paid date is required at Excel row " + (i + 1));
                }

                double amountPaid;

                try {
                    amountPaid = Double.parseDouble(amountPaidValue.trim());
                } catch (NumberFormatException ex) {
                    throw new RuntimeException("Invalid amount paid '" + amountPaidValue + "' at Excel row " + (i + 1));
                }

                if (amountPaid <= 0) {
                    throw new RuntimeException("Amount paid must be greater than 0 at Excel row " + (i + 1));
                }

                LocalDate paidDate;

                try {
                    paidDate = parseFlexibleDate(paidDateValue);
                } catch (Exception ex) {
                    throw new RuntimeException("Invalid paid date '" + paidDateValue + "' at Excel row " + (i + 1) + ". Supported formats: yyyy-MM-dd, M/d/yy, " + "M/d/yyyy, dd/MM/yyyy, dd-MM-yyyy");
                }

                int finalI = i;
                Student student = studentRepository
                        .findStudentByStudentCodeAndIsDeleted(studentCode, false)
                        .orElseThrow(() -> new RuntimeException("Student with code '" + studentCode + "' Not Found at Excel row " + (finalI + 1)));

                StudentFeePayments feePayments = new StudentFeePayments();

                feePayments.setTerm(term);
                feePayments.setSchoolFees(schoolFees);
                feePayments.setStudent(student);
                feePayments.setStudentLevel(student.getSchoolClass().getClassLevel());
                feePayments.setIsOverDueBeUsed(false);

                StudentFeePaymentsDetail detail = new StudentFeePaymentsDetail();

                detail.setAmountPaid(amountPaid);
                detail.setPaidDate(paidDate);
                detail.setStudentFeePayments(feePayments);

                feePayments.getStudentFeePaymentsDetails().add(detail);

                double totalPaidAmount = amountPaid;

                double amountMustPayment = getAmountMustPayment(student, schoolFees);

                double previousOverpayment = getExtraStudentFeesAmount(student.getId());

                double effectivePaidAmount = totalPaidAmount + previousOverpayment;

                double remainAmount = getRemainAmount(effectivePaidAmount, amountMustPayment);

                feePayments.setTotalAmountPaid(Math.min(effectivePaidAmount, amountMustPayment));

                feePayments.setRemainAmount(remainAmount);

                feePayments.setPaymentStatus(getPaymentStatus(remainAmount, amountMustPayment));

                feePayments.setOverDueAmount(getStudentOverPaidAmount( effectivePaidAmount, amountMustPayment));

                studentFeePaymentRepository.save(feePayments);

                schoolBalanceService.creditBalance(amountPaid);
            }

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException("Failed to import student fee payments. please try again");
        }
    }
*/

}
