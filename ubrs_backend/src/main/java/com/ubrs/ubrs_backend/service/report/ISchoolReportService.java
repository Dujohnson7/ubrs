package com.ubrs.ubrs_backend.service.report;

import com.ubrs.ubrs_backend.domain.projection.schoolReport.ClassPerformanceProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.PromotionRetentionProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.SubjectPerformanceProjection;

import java.util.List;
import java.util.UUID;

public interface ISchoolReportService {
    List<ClassPerformanceProjection> getClassPerformance(UUID academicYearId, String term, UUID classId);

    List<PromotionRetentionProjection> findPromotionRetention(UUID academicYearId, UUID classId);

    List<SubjectPerformanceProjection> findSubjectPerformance(UUID academicYearId, String term, UUID classId);
}
