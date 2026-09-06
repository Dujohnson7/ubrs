package com.ubrs.ubrs_backend.service.grade;

import com.ubrs.ubrs_backend.domain.dto.grade.GradeDetailsRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeRequestDto;
import com.ubrs.ubrs_backend.domain.dto.grade.GradeResponseDto;
import com.ubrs.ubrs_backend.domain.entity.*;
import com.ubrs.ubrs_backend.domain.mapper.GradeMapper;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeDetailProjection;
import com.ubrs.ubrs_backend.domain.projection.grade.ClassGradeStatusProjection;
import com.ubrs.ubrs_backend.repository.*;
import com.ubrs.ubrs_backend.service.users.UserDetailsImpl;
import com.ubrs.ubrs_backend.util.EAcademicState;
import com.ubrs.ubrs_backend.util.EAssignmentState;
import com.ubrs.ubrs_backend.util.EGradeState;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class GradeServiceImpl implements IGradeService {

    private final IUserRepository userRepository;
    private final IGradeRepository gradeRepository;
    private final GradeMapper courseAssigmentMapper;
    private final ICourseRepository courseRepository;
    private final IStudentRepository studentRepository;
    private final ISchoolClassRepository schoolClassRepository;
    private final IAcademicYearRepository academicYearRepository;
    private final ICourseAssignmentRepository  courseAssignmentRepository;


    @Override
    public GradeResponseDto getGradeById(UUID gradeId) {
        Grade foundGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found") );
        return courseAssigmentMapper.toGradeDto(foundGrade);
    }

    @Override
    public GradeResponseDto saveGrade(GradeRequestDto gradeRequestDto) {

        if (gradeRequestDto == null) {
            throw new NullPointerException("Please fill Grade Data");
        }

        Grade grade = new Grade();

        Course foundCourse = courseRepository.findCourseByIdAndIsDeleted(gradeRequestDto.getCourseId(), false)
                .orElseThrow(() -> new RuntimeException("Course Not Found") );

        SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(gradeRequestDto.getSchoolClassId(), false)
                .orElseThrow(() -> new RuntimeException("Class Not Found") );

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(gradeRequestDto.getAcademicYearId(), false)
                .orElseThrow(() -> new RuntimeException("ACADEMIC YEAR NOT FOUND"));

        CourseAssignment courseAssignment = courseAssignmentRepository.findCourseAssignmentBySchoolClass_IdAndCourse_IdAndAssignmentStatusAndIsDeleted(foundSchoolClass.getId(), foundCourse.getId(), EAssignmentState.ACTIVE, false);

        if (gradeRepository.existsBySchoolClass_IdAndAcademicYear_IdAndTermAndCourse_IdAndGradeTypeAndSubmitStatusInAndIsDeleted(foundSchoolClass.getId(), foundAcademicYear.getId(), gradeRequestDto.getTerm(), foundCourse.getId(), gradeRequestDto.getGradeType(), List.of(EGradeState.APPROVED, EGradeState.SUBMITTED, EGradeState.REJECTED, EGradeState.DRAFT), false)){
            throw new RuntimeException("Grade Already Exists, Check if it is reject you can collect to what you have");
        }

        grade.setCourse(foundCourse);
        grade.setTeacher(courseAssignment.getTeacher());
        grade.setSchoolClass(foundSchoolClass);
        grade.setAcademicYear(foundAcademicYear);
        grade.setTerm(gradeRequestDto.getTerm());
        grade.setMaxMark(gradeRequestDto.getMaxMark());
        grade.setGradeType(gradeRequestDto.getGradeType());
        grade.setSubmitStatus(EGradeState.DRAFT);

        if (gradeRequestDto.getGradeDetails() != null) {
            for (GradeDetailsRequestDto details : gradeRequestDto.getGradeDetails()){

                Student foundStudent = studentRepository.findStudentByIdAndIsDeleted(details.getStudentId(), false)
                        .orElseThrow(() -> new RuntimeException("Student Not Found") );

                if (foundStudent.getSchoolClass() == null || !foundStudent.getSchoolClass().getId().equals(foundSchoolClass.getId())) {
                    throw new RuntimeException("Student does not belong to the selected class");
                }

                if (details.getMark().compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Mark cannot be negative");
                }

                if (gradeRequestDto.getMaxMark() != null && details.getMark().compareTo(gradeRequestDto.getMaxMark()) > 0) {
                    throw new RuntimeException("Mark cannot be greater than max mark");
                }

                GradeDetails gradeDetails = new GradeDetails();

                gradeDetails.setStudent(foundStudent);
                gradeDetails.setMark(details.getMark());
                gradeDetails.setGrade(grade);
            }
        }

        if (gradeRequestDto.getGradeDetails() != null) {

            for (GradeDetailsRequestDto details : gradeRequestDto.getGradeDetails()) {

                if (details.getStudentId() == null) {
                    throw new RuntimeException("Student ID is required");
                }

                Student foundStudent = studentRepository.findStudentByIdAndIsDeleted(details.getStudentId(), false)
                        .orElseThrow(() -> new RuntimeException("Student Not Found"));

                GradeDetails gradeDetails = new GradeDetails();

                gradeDetails.setStudent(foundStudent);
                gradeDetails.setMark(details.getMark());
                gradeDetails.setGrade(grade);

                grade.getGradeDetails().add(gradeDetails);
            }
        }


        Grade result = gradeRepository.save(grade);
        return courseAssigmentMapper.toGradeDto(result);
    }

    @Override
    @Transactional
    public GradeResponseDto updateGrade(UUID gradeId, GradeRequestDto gradeRequestDto) {

        if (gradeRequestDto == null) {
            throw new NullPointerException("Please fill Grade Data");
        }

        Grade existGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found"));

        Course foundCourse = courseRepository
                .findCourseByIdAndIsDeleted(gradeRequestDto.getCourseId(), false)
                .orElseThrow(() -> new RuntimeException("Course Not Found"));

        SchoolClass foundSchoolClass = schoolClassRepository.findSchoolClassByIdAndIsDeleted(gradeRequestDto.getSchoolClassId(), false)
                .orElseThrow(() -> new RuntimeException("Class Not Found"));

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(gradeRequestDto.getAcademicYearId(), false)
                .orElseThrow(() -> new RuntimeException("Academic Year Not Found"));

        existGrade.setCourse(foundCourse);
        existGrade.setSchoolClass(foundSchoolClass);
        existGrade.setAcademicYear(foundAcademicYear);
        existGrade.setTerm(gradeRequestDto.getTerm());
        existGrade.setMaxMark(gradeRequestDto.getMaxMark());
        existGrade.setGradeType(gradeRequestDto.getGradeType());
        existGrade.setFeedback(gradeRequestDto.getFeedback());

        if (gradeRequestDto.getGradeDetails() != null) {

            existGrade.getGradeDetails().clear();

            for (GradeDetailsRequestDto details : gradeRequestDto.getGradeDetails()) {

                if (details.getStudentId() == null) {
                    throw new RuntimeException("Student ID is required");
                }

                if (details.getMark() == null) {
                    throw new RuntimeException("Mark is required");
                }

                Student foundStudent = studentRepository
                        .findStudentByIdAndIsDeleted(details.getStudentId(), false)
                        .orElseThrow(() -> new RuntimeException("Student Not Found"));


                if (foundStudent.getSchoolClass() == null || !foundStudent.getSchoolClass().getId().equals(foundSchoolClass.getId())) {
                    throw new RuntimeException("Student does not belong to the selected class");
                }

                if (details.getMark().compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Mark cannot be negative");
                }

                if (gradeRequestDto.getMaxMark() != null && details.getMark().compareTo(gradeRequestDto.getMaxMark()) > 0) {
                    throw new RuntimeException("Mark cannot be greater than max mark");
                }

                GradeDetails gradeDetails = new GradeDetails();

                gradeDetails.setStudent(foundStudent);
                gradeDetails.setMark(details.getMark());
                gradeDetails.setGrade(existGrade);

                existGrade.getGradeDetails().add(gradeDetails);
            }
        }

        Grade result = gradeRepository.save(existGrade);

        return courseAssigmentMapper.toGradeDto(result);
    }

    @Override
    public void deleteGrade(UUID gradeId) {

        Grade existGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found") );

        existGrade.setIsDeleted(true);

        gradeRepository.save(existGrade);

    }

    @Override
    @Transactional
    public void importGrades(GradeRequestDto requestDto, MultipartFile file) {

        if (requestDto == null) {
            throw new NullPointerException("Please fill Grade Data");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload an Excel file");
        }

        Course foundCourse = courseRepository
                .findCourseByIdAndIsDeleted(requestDto.getCourseId(), false)
                .orElseThrow(() -> new RuntimeException("Course Not Found"));

        SchoolClass foundSchoolClass = schoolClassRepository
                .findSchoolClassByIdAndIsDeleted(requestDto.getSchoolClassId(), false)
                .orElseThrow(() -> new RuntimeException("Class Not Found") );

        AcademicYear foundAcademicYear = academicYearRepository.findAcademicYearByIdAndIsDeleted(requestDto.getAcademicYearId(), false)
                .orElseThrow(() -> new RuntimeException("Academic Year Not Found"));


        if (gradeRepository.existsBySchoolClass_IdAndAcademicYear_IdAndTermAndCourse_IdAndGradeTypeAndSubmitStatusInAndIsDeleted(foundSchoolClass.getId(), foundAcademicYear.getId(), requestDto.getTerm(), foundCourse.getId(), requestDto.getGradeType(), List.of(EGradeState.APPROVED, EGradeState.SUBMITTED, EGradeState.REJECTED, EGradeState.DRAFT), false)){
            throw new RuntimeException("Grade Already Exists, Check if it is reject you can collect to what you have");
        }

        Grade grade = new Grade();

        grade.setCourse(foundCourse);
        grade.setSubmittedBy(currentUser());
        grade.setSchoolClass(foundSchoolClass);
        grade.setAcademicYear(foundAcademicYear);
        grade.setTerm(requestDto.getTerm());
        grade.setMaxMark(requestDto.getMaxMark());
        grade.setGradeType(requestDto.getGradeType());
        grade.setFeedback(requestDto.getFeedback());
        grade.setSubmitStatus(EGradeState.DRAFT);

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel file does not contain any student records");
            }

            Map<String, Integer> columns = getGradeColumnIndexes(sheet);

            int studentCodeColumn = requireGradeColumn(columns, "studentcode");

            int markColumn = requireGradeColumn(columns, "mark");

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {

                Row row = sheet.getRow(rowIndex);

                if (row == null) {
                    continue;
                }

                String studentCode = getCellValue(row.getCell(studentCodeColumn));

                String markValue = getCellValue(row.getCell(markColumn));

                if (studentCode == null || studentCode.isBlank()) {
                    continue;
                }

                if (markValue == null || markValue.isBlank()) {
                    throw new RuntimeException("Mark is required for student: " + studentCode);
                }

                Student foundStudent = studentRepository.findStudentByStudentCodeAndIsDeleted(studentCode.trim(), false)
                        .orElseThrow(() -> new RuntimeException("Student Not Found: " + studentCode));

                if (foundStudent.getSchoolClass() == null || !foundStudent.getSchoolClass().getId().equals(foundSchoolClass.getId())) {
                    throw new RuntimeException("Student " + studentCode + " does not belong to the selected class");
                }

                BigDecimal mark;

                try {
                    mark = new BigDecimal(markValue.trim());
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid mark for student: " + studentCode);
                }

                if (mark.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Mark cannot be negative for student: " + studentCode);
                }

                if (requestDto.getMaxMark() != null && mark.compareTo(requestDto.getMaxMark()) > 0) {
                    throw new RuntimeException("Mark for student " + studentCode + " cannot be greater than max mark " + requestDto.getMaxMark()
                    );
                }

                GradeDetails gradeDetails = new GradeDetails();

                gradeDetails.setStudent(foundStudent);
                gradeDetails.setMark(mark);
                gradeDetails.setGrade(grade);

                grade.getGradeDetails().add(gradeDetails);
            }

            if (grade.getGradeDetails().isEmpty()) {
                throw new RuntimeException("No valid student records found in Excel file");
            }

            gradeRepository.save(grade);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import grades from Excel file", e);
        }
    }

    @Override
    public void submitGrade(UUID gradeId) {

        Grade existGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found") );

        if (existGrade.getSubmitStatus() != EGradeState.DRAFT){
            throw new RuntimeException("Sorry you can not submit this grade.");
        }

        existGrade.setSubmitStatus(EGradeState.SUBMITTED);
        gradeRepository.save(existGrade);
    }

    @Override
    public void approveGrade(UUID gradeId) {

        Grade existGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found") );

        if (existGrade.getSubmitStatus() != EGradeState.SUBMITTED){
            throw new RuntimeException("Grade is not yet submitted");
        }

        existGrade.setSubmitStatus(EGradeState.APPROVED);
        existGrade.setApprovedBy(currentUser());

        gradeRepository.save(existGrade);
    }

    @Override
    public void rejectGrade(UUID gradeId, String feedback) {

        Grade existGrade = gradeRepository.findGradeByIdAndIsDeleted(gradeId, false)
                .orElseThrow(() -> new RuntimeException("Grade Not Found") );

        if (existGrade.getSubmitStatus() != EGradeState.SUBMITTED){
            throw new RuntimeException("Grade is not yet submitted");
        }

        existGrade.setSubmitStatus(EGradeState.REJECTED);
        existGrade.setFeedback(feedback);
        existGrade.setApprovedBy(currentUser());

        gradeRepository.save(existGrade);

    }


    @Override
    public List<GradeResponseDto> getAllGrades() {
        List<Grade> gradeList =  gradeRepository.findAllByIsDeleted(false);
        return courseAssigmentMapper.toGradeDtoList(gradeList);
    }

    @Override
    public List<GradeResponseDto> getAllGradesByTeacher(UUID teacherId) {
        List<Grade> gradeList =  gradeRepository.findAllByTeacher_IdAndIsDeleted(teacherId, false);
        return courseAssigmentMapper.toGradeDtoList(gradeList);
    }

    @Override
    public List<GradeResponseDto> getAllGradesByClass(UUID classId) {
        List<Grade> gradeList =  gradeRepository.findAllByAcademicYear_IdAndSchoolClass_IdAndIsDeleted(activateAcademicYear().getId(), classId, false);
        return courseAssigmentMapper.toGradeDtoList(gradeList);
    }

    @Override
    public List<ClassGradeStatusProjection> getClassGradeStatus() {
        return gradeRepository.findClassGradeStatus();
    }

    @Override
    public List<ClassGradeDetailProjection> getClassGradeDetails(UUID classId, UUID academicYearId, ETerm term) {
        return gradeRepository.findClassGradeDetails(classId, academicYearId, term);
    }

    @Override
    public List<GradeResponseDto> getAllByAcademicYearAndTermAndSchoolClassAndCourse(UUID academicYearId, ETerm term, UUID schoolClassId, UUID courseId) {
        List<Grade> gradeList =  gradeRepository.findAllByAcademicYear_IdAndTermAndSchoolClass_IdAndCourse_IdAndIsDeleted(academicYearId, term, schoolClassId, courseId, false);
        return courseAssigmentMapper.toGradeDtoList(gradeList);
    }


    private Users currentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetailsImpl customUser) {
            return  userRepository.findUsersByIdAndIsDeleted(customUser.getUserId(), false).orElse(null);
        }
        return null;
    }


    private AcademicYear activateAcademicYear(){
        return academicYearRepository.findAcademicYearByAcademicYearStatusAndIsDeleted(EAcademicState.ACTIVE, false).orElse(null);
    }

    private Map<String, Integer> getGradeColumnIndexes(Sheet sheet) {

        Map<String, Integer> columns = new HashMap<>();

        Row headerRow = sheet.getRow(0);

        if (headerRow == null) {
            throw new RuntimeException("Excel header row is missing");
        }

        for (Cell cell : headerRow) {

            String header = getCellValue(cell);

            if (header == null || header.isBlank()) {
                continue;
            }

            String normalizedHeader = header
                    .trim()
                    .toLowerCase()
                    .replace(" ", "")
                    .replace("_", "");

            columns.put(normalizedHeader, cell.getColumnIndex());
        }

        return columns;
    }

    private int requireGradeColumn(Map<String, Integer> columns, String columnName) {

        Integer columnIndex = columns.get(columnName);

        if (columnIndex == null) {
            throw new RuntimeException("Required Excel column is missing: " + columnName);
        }

        return columnIndex;
    }

    private String getCellValue(Cell cell) {

        if (cell == null) {
            return null;
        }

        DataFormatter formatter = new DataFormatter();

        String value = formatter.formatCellValue(cell);

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
