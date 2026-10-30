package com.ubrs.ubrs_backend.service.midTermReport;

import com.ubrs.ubrs_backend.domain.projection.studentReport.MidTermReportProjection;
import com.ubrs.ubrs_backend.util.ETerm;

import java.util.List;
import java.util.UUID;

public interface IMidTermReportService {
    List<MidTermReportProjection> getMidTermReport(UUID academicYearId, UUID schoolClassId);
    List<MidTermReportProjection> getMidTermReportByClassTeacher(UUID teacherId, UUID academicYearId);
    List<MidTermReportProjection> getMidTermReportByTerm(UUID academicYearId, UUID schoolClassId, ETerm term);
    List<MidTermReportProjection> getMidTermReportByParent(UUID parentId, UUID academicYearId, ETerm term);
}
