package com.ubrs.ubrs_backend.controller.report;

import com.ubrs.ubrs_backend.domain.projection.schoolReport.ClassPerformanceProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.PromotionRetentionProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.SubjectPerformanceProjection;
import com.ubrs.ubrs_backend.service.report.ISchoolReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schoolReport")
public class SchoolReportController {

    private final ISchoolReportService reportService;



    @GetMapping("/class-performance")
    public ResponseEntity<List<ClassPerformanceProjection>> getClassPerformance(
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) UUID classId
    ) {
        return ResponseEntity.ok(reportService.getClassPerformance(academicYearId, term, classId));
    }



    @GetMapping("/subject-performance")
    public ResponseEntity<List<SubjectPerformanceProjection>> getSubjectPerformance(
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) UUID classId
    ) {
        return ResponseEntity.ok(reportService.findSubjectPerformance( academicYearId,  term,  classId));
    }



    @GetMapping("/promotion-retention")
    public ResponseEntity<List<PromotionRetentionProjection>> getPromotionRetention(
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) UUID classId
    ) {
        return ResponseEntity.ok(reportService.findPromotionRetention(academicYearId, classId));
    }

}
