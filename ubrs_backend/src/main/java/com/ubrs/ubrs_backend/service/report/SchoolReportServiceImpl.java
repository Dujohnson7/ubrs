package com.ubrs.ubrs_backend.service.report;

import com.ubrs.ubrs_backend.domain.projection.schoolReport.ClassPerformanceProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.PromotionRetentionProjection;
import com.ubrs.ubrs_backend.domain.projection.schoolReport.SubjectPerformanceProjection;
import com.ubrs.ubrs_backend.repository.ISchoolReportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SchoolReportServiceImpl implements ISchoolReportService{

    private final ISchoolReportRepository schoolReportRepository;

    @Override
    public List<ClassPerformanceProjection> getClassPerformance(UUID academicYearId, String term, UUID classId) {
        return schoolReportRepository.findClassPerformance(academicYearId, term, classId);
    }

    @Override
    public List<PromotionRetentionProjection> findPromotionRetention(UUID academicYearId, UUID classId) {
        return schoolReportRepository.findPromotionRetention(academicYearId, classId);
    }

    @Override
    public List<SubjectPerformanceProjection> findSubjectPerformance(UUID academicYearId, String term, UUID classId) {
        return schoolReportRepository.findSubjectPerformance(academicYearId, term, classId);
    }
}
