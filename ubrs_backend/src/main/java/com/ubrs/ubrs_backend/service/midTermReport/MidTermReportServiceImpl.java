package com.ubrs.ubrs_backend.service.midTermReport;

import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.domain.projection.studentReport.MidTermReportProjection;
import com.ubrs.ubrs_backend.repository.IMidTermReportRepository;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.util.ETerm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MidTermReportServiceImpl implements IMidTermReportService{

    private final IMidTermReportRepository midTermReportRepository;
    private final ISchoolClassRepository schoolClassRepository;

    @Override
    public List<MidTermReportProjection> getMidTermReport(UUID academicYearId, UUID schoolClassId) {
        return midTermReportRepository.findMidTermReport(academicYearId, schoolClassId);
    }

    @Override
    public List<MidTermReportProjection> getMidTermReportByClassTeacher(UUID teacherId, UUID academicYearId) {
        SchoolClass classAsTeacher = schoolClassRepository.findSchoolClassByClassTeacher_IdAndIsDeleted(teacherId, false);
        return midTermReportRepository.findMidTermReport(academicYearId, classAsTeacher.getId());
    }

    @Override
    public List<MidTermReportProjection> getMidTermReportByTerm(UUID academicYearId, UUID schoolClassId, ETerm term) {
        return midTermReportRepository.findMidTermReportByTerm(academicYearId, schoolClassId, term);
    }

    @Override
    public List<MidTermReportProjection> getMidTermReportByParent(UUID parentId, UUID academicYearId, ETerm term) {
        return midTermReportRepository.findMidTermReportByParent(parentId, academicYearId, term);
    }
}
