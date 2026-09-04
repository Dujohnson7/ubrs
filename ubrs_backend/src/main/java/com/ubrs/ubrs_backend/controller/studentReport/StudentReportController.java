package com.ubrs.ubrs_backend.controller.studentReport;

import com.ubrs.ubrs_backend.domain.projection.studentReport.GradeReportProjection;
import com.ubrs.ubrs_backend.service.studentReport.IStudentReportService;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studentReport")
public class StudentReportController {

    private final IStudentReportService studentReportService;

    @GetMapping("/grade-report")
    public ResponseEntity<List<GradeReportProjection>> getStudentGradeReport(
            @RequestParam UUID academicYearId,
            @RequestParam UUID schoolClassId
    ) {
        return ResponseEntity.ok(studentReportService.getStudentGradeReport(academicYearId, schoolClassId));
    }


    @GetMapping("/classTeacher/grade-report/{teacherId}")
    public ResponseEntity<List<GradeReportProjection>> getStudentGradeReportByClassTeacher(
            @PathVariable UUID teacherId,
            @RequestParam UUID academicYearId
    ) {
        return ResponseEntity.ok(studentReportService.getStudentGradeReportByClassTeacher(teacherId, academicYearId));
    }


    @GetMapping("/term/grade-report")
    public ResponseEntity<List<GradeReportProjection>> getStudentGradeReportByTerm(
            @RequestParam UUID academicYearId,
            @RequestParam UUID schoolClassId,
            @RequestParam ETerm term
    ) {
        return ResponseEntity.ok(studentReportService.getStudentGradeReportByTerm(academicYearId, schoolClassId, term));
    }

    @GetMapping("/parent/grade-report")
    public ResponseEntity<List<GradeReportProjection>> getStudentGradeReportByParent(
            @RequestParam UUID parentId,
            @RequestParam UUID academicYearId,
            @RequestParam (required = false) ETerm term
    ) {
        return ResponseEntity.ok(studentReportService.getStudentGradeReportByParent(parentId, academicYearId, term));
    }
}
