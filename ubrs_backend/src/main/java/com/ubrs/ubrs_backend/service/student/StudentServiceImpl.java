package com.ubrs.ubrs_backend.service.student;

import com.ubrs.ubrs_backend.domain.dto.student.StudentRequestDto;
import com.ubrs.ubrs_backend.domain.dto.student.StudentResponseDto;
import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.entity.Student;
import com.ubrs.ubrs_backend.domain.mapper.StudentMapper;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.repository.IStudentRepository;
import com.ubrs.ubrs_backend.util.EGender;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.EStudentState;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.time.format.DateTimeParseException;
import java.util.*;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentServiceImpl implements IStudentService {

    private final ISchoolClassRepository schoolClassRepository;
    private final IStudentRepository studentRepository;
    private final StudentMapper studentMapper;

    @Override
    public StudentResponseDto getStudentById(UUID studentId) {
        Student foundStudent = studentRepository.findStudentByIdAndIsDeleted(studentId, false)
                .orElseThrow(() -> new RuntimeException("Student Not Found") );
        return studentMapper.toStudentDto(foundStudent);
    }

    @Override
    public StudentResponseDto saveStudent(StudentRequestDto studentRequestDto) {

        if (studentRequestDto == null) {
            throw new NullPointerException("Please fill student Data");
        }

        SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(studentRequestDto.getSchoolClassId(), false)
                .orElseThrow(() -> new RuntimeException("School Class Not Found") );

        if (studentRepository.existsByStudentCodeAndIsDeleted(studentRequestDto.getStudentCode(), false)){
            throw new RuntimeException("Student is Already Exists");
        }

        Student student = new Student();

        student.setStudentCode(studentRequestDto.getStudentCode());
        student.setFirstName(studentRequestDto.getFirstName());
        student.setLastName(studentRequestDto.getLastName());
        student.setDateOfBirth(studentRequestDto.getDateOfBirth());
        student.setGender(studentRequestDto.getGender());

        if (studentRequestDto.getMiddleName() != null) {
            student.setMiddleName(studentRequestDto.getMiddleName());
        }

        if (studentRequestDto.getFatherName() != null) {
            student.setFatherName(studentRequestDto.getFatherName());
            student.setFatherPhone(studentRequestDto.getFatherPhone());
        }

        if (studentRequestDto.getMotherName() != null) {
            student.setMotherName(studentRequestDto.getMotherName());
            student.setMotherPhone(studentRequestDto.getMotherPhone());
        }

        if (studentRequestDto.getGuardianName() != null) {
            student.setGuardianName(studentRequestDto.getGuardianName());
            student.setGuardianPhone(studentRequestDto.getGuardianPhone());
        }

        student.setStudentStatus(EStudentState.ACTIVE);
        student.setSchoolClass(foundSchoolClass);

        Student result = studentRepository.save(student);
        return studentMapper.toStudentDto(result);
    }

    @Override
    public StudentResponseDto updateStudent(UUID studentId, StudentRequestDto studentRequestDto) {
        Student existStudent = studentRepository.findStudentByIdAndIsDeleted(studentId, false)
                .orElseThrow(() -> new RuntimeException("Student Not Found") );

        if (!studentRequestDto.getSchoolClassId().equals(existStudent.getSchoolClass().getId())) {
            SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(studentRequestDto.getSchoolClassId(), false)
                    .orElseThrow(() -> new RuntimeException("School Class Not Found") );
            existStudent.setSchoolClass(foundSchoolClass);
        }

        if (!studentRequestDto.getStudentCode().equals(existStudent.getStudentCode()) &&
                !studentRepository.existsByStudentCodeAndIsDeleted(studentRequestDto.getStudentCode(), false)){
            existStudent.setStudentCode(studentRequestDto.getStudentCode());
        }

        existStudent.setStudentCode(studentRequestDto.getStudentCode());
        existStudent.setFirstName(studentRequestDto.getFirstName());
        existStudent.setLastName(studentRequestDto.getLastName());
        existStudent.setDateOfBirth(studentRequestDto.getDateOfBirth());
        existStudent.setGender(studentRequestDto.getGender());
        existStudent.setStudentStatus(studentRequestDto.getStudentStatus());

        if (studentRequestDto.getMiddleName() != null) {
            existStudent.setMiddleName(studentRequestDto.getMiddleName());
        }

        if (studentRequestDto.getFatherName() != null) {
            existStudent.setFatherName(studentRequestDto.getFatherName());
            existStudent.setFatherPhone(studentRequestDto.getFatherPhone());
        }

        if (studentRequestDto.getMotherName() != null) {
            existStudent.setMotherName(studentRequestDto.getMotherName());
            existStudent.setMotherPhone(studentRequestDto.getMotherPhone());
        }

        if (studentRequestDto.getGuardianName() != null) {
            existStudent.setGuardianName(studentRequestDto.getGuardianName());
            existStudent.setGuardianPhone(studentRequestDto.getGuardianPhone());
        }

        Student result = studentRepository.save(existStudent);
        return studentMapper.toStudentDto(result);

    }

    @Override
    public void deleteStudent(UUID studentId) {

        Student existStudent = studentRepository.findStudentByIdAndIsDeleted(studentId, false)
                .orElseThrow(() -> new RuntimeException("Student Not Found") );

        existStudent.setIsDeleted(true);
        studentRepository.save(existStudent);
    }

    @Override
    @Transactional
    public void importStudents(UUID classId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload an Excel file");
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            SchoolClass schoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(classId, false)
                    .orElseThrow(() -> new RuntimeException("School Class Not Found"));

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
            requireColumn(columnIndexes, "firstname");
            requireColumn(columnIndexes, "lastname");
            requireColumn(columnIndexes, "gender");
            requireColumn(columnIndexes, "dateofbirth");

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

                String firstName = getCellValue(row, columnIndexes, "firstname", formatter);

                String middleName = getCellValue(row, columnIndexes, "middlename", formatter);

                String lastName = getCellValue(row, columnIndexes, "lastname", formatter);

                String dateOfBirthValue = getCellValue(row, columnIndexes, "dateofbirth", formatter);

                String genderValue = getCellValue(row, columnIndexes, "gender", formatter);

                String fatherName = getCellValue(row, columnIndexes, "fathername", formatter);

                String fatherPhone = getCellValue(row, columnIndexes, "fatherphone", formatter);

                String motherName = getCellValue(row, columnIndexes, "mothername", formatter);

                String motherPhone = getCellValue(row, columnIndexes, "motherphone", formatter);

                String guardianName = getCellValue(row, columnIndexes, "guardianname", formatter);

                String guardianPhone = getCellValue(row, columnIndexes, "guardianphone", formatter);

                if (firstName.isBlank()) {
                    throw new RuntimeException("First name is required at Excel row " + (i + 1));
                }

                if (lastName.isBlank()) {
                    throw new RuntimeException("Last name is required at Excel row " + (i + 1));
                }

                if (genderValue.isBlank()) {
                    throw new RuntimeException("Gender is required at Excel row " + (i + 1));
                }

                if (dateOfBirthValue.isBlank()) {
                    throw new RuntimeException("Date of birth is required at Excel row " + (i + 1));
                }

                EGender gender;

                try {
                    gender = EGender.valueOf(genderValue.trim().toUpperCase());
                } catch (Exception ex) {
                    throw new RuntimeException("Invalid gender '" + genderValue + "' at Excel row " + (i + 1));
                }

                LocalDate dateOfBirth;

                try {
                    dateOfBirth = parseFlexibleDate(dateOfBirthValue);
                } catch (Exception ex) {
                    throw new RuntimeException(
                            "Invalid date of birth '" + dateOfBirthValue + "' at Excel row " + (i + 1) + ". Supported formats: yyyy-MM-dd, M/d/yy, M/d/yyyy, dd/MM/yyyy, dd-MM-yyyy"
                    );
                }

                Student student = studentRepository
                        .findStudentByStudentCodeAndIsDeleted(studentCode, false)
                        .orElse(null);

                if (student == null) {

                    student = new Student();

                    student.setStudentCode(studentCode);
                    student.setFirstName(firstName);
                    student.setLastName(lastName);
                    student.setDateOfBirth(dateOfBirth);
                    student.setGender(gender);

                    if (!middleName.isBlank()) {
                        student.setMiddleName(middleName);
                    }

                    if (!fatherName.isBlank()) {
                        student.setFatherName(fatherName);
                        student.setFatherPhone(fatherPhone);
                    }

                    if (!motherName.isBlank()) {
                        student.setMotherName(motherName);
                        student.setMotherPhone(motherPhone);
                    }

                    if (!guardianName.isBlank()) {
                        student.setGuardianName(guardianName);
                        student.setGuardianPhone(guardianPhone);
                    }

                    student.setStudentStatus(EStudentState.ACTIVE);
                    student.setSchoolClass(schoolClass);

                    studentRepository.save(student);

                } else {

                    student.setFirstName(firstName);
                    student.setLastName(lastName);
                    student.setDateOfBirth(dateOfBirth);
                    student.setGender(gender);

                    if (!middleName.isBlank()) {
                        student.setMiddleName(middleName);
                    } else {
                        student.setMiddleName(null);
                    }

                    if (!fatherName.isBlank()) {
                        student.setFatherName(fatherName);
                        student.setFatherPhone(fatherPhone);
                    } else {
                        student.setFatherName(null);
                        student.setFatherPhone(null);
                    }

                    if (!motherName.isBlank()) {
                        student.setMotherName(motherName);
                        student.setMotherPhone(motherPhone);
                    } else {
                        student.setMotherName(null);
                        student.setMotherPhone(null);
                    }

                    if (!guardianName.isBlank()) {
                        student.setGuardianName(guardianName);
                        student.setGuardianPhone(guardianPhone);
                    } else {
                        student.setGuardianName(null);
                        student.setGuardianPhone(null);
                    }

                    student.setStudentStatus(EStudentState.ACTIVE);
                    student.setSchoolClass(schoolClass);

                    studentRepository.save(student);
                }
            }

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(e.getMessage());
        }
    }


    @Override
    public List<StudentResponseDto> getAllStudents() {
        List<Student> studentList = studentRepository.findAllByIsDeleted(false);
        return studentMapper.toStudentDtoList(studentList);
    }

    @Override
    public List<StudentResponseDto> getAllStudentsBySchoolLevel(ESchoolLevel schoolLevel) {
        List<Student> studentList = studentRepository.findStudentBySchoolClass_ClassLevelAndIsDeleted(schoolLevel, false);
        return studentMapper.toStudentDtoList(studentList);
    }

    @Override
    public List<StudentResponseDto> getAllStudentsByClass(UUID classId) {
        List<Student> studentList = studentRepository.findAllBySchoolClass_IdAndIsDeleted(classId, false);
        return studentMapper.toStudentDtoList(studentList);
    }

    @Override
    public long totalStudents() {
        return studentRepository.countAllByStudentStatusAndIsDeleted(EStudentState.ACTIVE, false);
    }

    @Override
    public long totalStudentsBySchoolLevel(ESchoolLevel schoolLevel) {
        return studentRepository.countAllBySchoolClass_ClassLevelAndStudentStatusAndIsDeleted(schoolLevel, EStudentState.ACTIVE, false);
    }

    @Override
    public long totalStudentsByClass(UUID classId) {
        return studentRepository.countAllBySchoolClass_IdAndStudentStatusAndIsDeleted(classId, EStudentState.ACTIVE, false);
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

    private void requireColumn(Map<String, Integer> columnIndexes, String columnName) {

        if (!columnIndexes.containsKey(columnName)) {

            throw new RuntimeException("Required Excel column '" + columnName + "' was not found"
            );
        }
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

}
