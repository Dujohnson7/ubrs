package com.ubrs.ubrs_backend.service.dashboard;

import com.ubrs.ubrs_backend.domain.dto.dashboard.AverageMarksBySubjectDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.GradeDistributionDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.MarksSubmissionTrendsDto;

public interface IHeaderTeacherDashboardService {
    AverageMarksBySubjectDto getAverageMarksBySubject();
    MarksSubmissionTrendsDto getMarksSubmissionTrends();
    GradeDistributionDto getGradeDistribution();
}
