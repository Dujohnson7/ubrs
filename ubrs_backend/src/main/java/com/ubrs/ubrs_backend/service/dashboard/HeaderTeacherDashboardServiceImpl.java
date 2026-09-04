package com.ubrs.ubrs_backend.service.dashboard;

import com.ubrs.ubrs_backend.domain.dto.dashboard.AverageMarksBySubjectDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.GradeDistributionDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.MarksSubmissionTrendsDto;
import com.ubrs.ubrs_backend.repository.IGradeRepository;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.util.EAcademicState;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class HeaderTeacherDashboardServiceImpl implements IHeaderTeacherDashboardService {

    private final IGradeRepository gradeRepository;
    private final ISchoolClassRepository schoolClassRepository;

    @Override
    public AverageMarksBySubjectDto getAverageMarksBySubject() {
        // Get all subjects from courses
        List<String> allSubjects = Arrays.asList(
            "Math", "English", "Kinyarwanda", "Science", 
            "Social Studies", "Rel. Ed.", "Arts", "PE"
        );

        // Calculate average marks for nursery level
        AverageMarksBySubjectDto.SubjectLevelData nurseryData = calculateAverageMarksByLevel(ESchoolLevel.NURSERY, allSubjects);
        
        // Calculate average marks for primary level
        AverageMarksBySubjectDto.SubjectLevelData primaryData = calculateAverageMarksByLevel(ESchoolLevel.PRIMARY, allSubjects);

        return new AverageMarksBySubjectDto(
            allSubjects,
            nurseryData,
            primaryData,
            "2025-2026",
            "Term 1"
        );
    }

    private AverageMarksBySubjectDto.SubjectLevelData calculateAverageMarksByLevel(ESchoolLevel level, List<String> subjects) {
        List<Double> averageMarks = new ArrayList<>();
        
        for (String subject : subjects) {
            // This would need a proper query to get average marks by subject and level
            // For now, returning placeholder data
            double avg = level == ESchoolLevel.NURSERY ? 75.0 : 80.0;
            averageMarks.add(avg);
        }

        return new AverageMarksBySubjectDto.SubjectLevelData(
            level == ESchoolLevel.NURSERY ? "Nursery" : "Primary",
            averageMarks
        );
    }

    @Override
    public MarksSubmissionTrendsDto getMarksSubmissionTrends() {
        List<String> academicYears = Arrays.asList("2023-2024", "2024-2025", "2025-2026");
        List<String> terms = Arrays.asList("Term 1", "Term 2", "Term 3");

        Map<String, MarksSubmissionTrendsDto.TermData> trendsByYear = new HashMap<>();

        // 2023-2024
        trendsByYear.put("2023-2024", new MarksSubmissionTrendsDto.TermData(
            Arrays.asList(12, 15, 18),
            Arrays.asList(14, 17, 20),
            Arrays.asList(22, 14, 8),
            Arrays.asList(2, 3, 2)
        ));

        // 2024-2025
        trendsByYear.put("2024-2025", new MarksSubmissionTrendsDto.TermData(
            Arrays.asList(10, 14, 19),
            Arrays.asList(13, 16, 21),
            Arrays.asList(24, 16, 9),
            Arrays.asList(1, 2, 3)
        ));

        // 2025-2026
        trendsByYear.put("2025-2026", new MarksSubmissionTrendsDto.TermData(
            Arrays.asList(8, 11, 0),
            Arrays.asList(10, 13, 0),
            Arrays.asList(26, 19, 0),
            Arrays.asList(2, 2, 0)
        ));

        return new MarksSubmissionTrendsDto(academicYears, terms, trendsByYear);
    }

    @Override
    public GradeDistributionDto getGradeDistribution() {
        List<GradeDistributionDto.ClassGradeData> classData = new ArrayList<>();

        // Get all classes
        var allClasses = schoolClassRepository.findAllByIsDeleted(false);

        for (var schoolClass : allClasses) {
            // Calculate grade distribution for each class
            // This would need a proper query to get actual grade distribution
            int total = 10;
            classData.add(new GradeDistributionDto.ClassGradeData(
                schoolClass.getName(),
                3,  // a1
                4,  // b2
                2,  // b3
                1,  // c4
                0,  // d
                total
            ));
        }

        return new GradeDistributionDto(classData, "2025-2026", "Term 1");
    }
}
