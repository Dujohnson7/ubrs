package com.ubrs.ubrs_backend.controller.studentReport;

import com.ubrs.ubrs_backend.domain.projection.studentReport.MidTermReportProjection;
import com.ubrs.ubrs_backend.service.midTermReport.IMidTermReportService;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/midTerm")
public class MidTermReportController {

    private final IMidTermReportService midTermReportService;

    @GetMapping("/midTerm-report")
    public ResponseEntity<List<MidTermReportProjection>> getMidTermReport(
            @RequestParam UUID academicYearId,
            @RequestParam UUID schoolClassId
    ) {
        return ResponseEntity.ok(midTermReportService.getMidTermReport(academicYearId, schoolClassId));
    }


    @GetMapping("/classTeacher/midTerm-report/{teacherId}")
    public ResponseEntity<List<MidTermReportProjection>> getMidTermReportByClassTeacher(
            @PathVariable UUID teacherId,
            @RequestParam UUID academicYearId
    ) {
        return ResponseEntity.ok(midTermReportService.getMidTermReportByClassTeacher(teacherId, academicYearId));
    }


    @GetMapping("/term/midTerm-report")
    public ResponseEntity<List<MidTermReportProjection>> getMidTermReportByTerm(
            @RequestParam UUID academicYearId,
            @RequestParam UUID schoolClassId,
            @RequestParam ETerm term
    ) {
        return ResponseEntity.ok(midTermReportService.getMidTermReportByTerm(academicYearId, schoolClassId, term));
    }

    @GetMapping("/parent/midTerm-report")
    public ResponseEntity<List<MidTermReportProjection>> getMidTermReportByParent(
            @RequestParam UUID parentId,
            @RequestParam UUID academicYearId,
            @RequestParam (required = false) ETerm term
    ) {
        return ResponseEntity.ok(midTermReportService.getMidTermReportByParent(parentId, academicYearId, term));
    }
}

