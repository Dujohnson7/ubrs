package com.ubrs.ubrs_backend.service.studentReport;

import com.ubrs.ubrs_backend.domain.projection.studentReport.GradeReportProjection;
import com.ubrs.ubrs_backend.repository.IStudentReportRepository;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentReportServiceImpl implements IStudentReportService {

    private final IStudentReportRepository studentReportRepository;

    @Override
    public List<GradeReportProjection> getStudentGradeReport(UUID academicYearId, UUID schoolClassId) {
        return studentReportRepository.findStudentGradeReport(academicYearId, schoolClassId);
    }

    @Override
    public List<GradeReportProjection> getStudentGradeReportByTerm(UUID academicYearId, UUID schoolClassId, ETerm term) {
        return studentReportRepository.findStudentGradeReportByTerm(academicYearId, schoolClassId, term);
    }

    @Override
    public List<GradeReportProjection> getStudentGradeReportByParent(UUID parentId, UUID academicYearId, ETerm term) {
        return studentReportRepository.findStudentGradeReportByParent(parentId, academicYearId, term);
    }
}
