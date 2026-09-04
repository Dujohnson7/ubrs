package com.ubrs.ubrs_backend.service.studentReport;

import com.ubrs.ubrs_backend.domain.projection.studentReport.GradeReportProjection;
import com.ubrs.ubrs_backend.util.ETerm;

import java.util.List;
import java.util.UUID;

public interface IStudentReportService {
    List<GradeReportProjection> getStudentGradeReport(UUID academicYearId, UUID schoolClassId);
    List<GradeReportProjection> getStudentGradeReportByClassTeacher(UUID teacherId, UUID academicYearId);
    List<GradeReportProjection> getStudentGradeReportByTerm(UUID academicYearId, UUID schoolClassId, ETerm term);
    List<GradeReportProjection> getStudentGradeReportByParent(UUID parentId, UUID academicYearId, ETerm term);

}
