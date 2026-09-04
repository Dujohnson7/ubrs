package com.ubrs.ubrs_backend.service.dashboard;

import com.ubrs.ubrs_backend.domain.dto.academicYear.AcademicYearResponseDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.AverageMarksBySubjectDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.GradeDistributionDto;
import com.ubrs.ubrs_backend.domain.dto.dashboard.MarksSubmissionTrendsDto;
import com.ubrs.ubrs_backend.repository.IGradeRepository;
import com.ubrs.ubrs_backend.repository.ISchoolClassRepository;
import com.ubrs.ubrs_backend.service.academicYear.IAcademicYearService;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class HeaderTeacherDashboardServiceImpl implements IHeaderTeacherDashboardService {

    private final IGradeRepository gradeRepository;
    private final ISchoolClassRepository schoolClassRepository;
    private final IAcademicYearService academicYearService;

    @Override
    public AverageMarksBySubjectDto getAverageMarksBySubject() {
        try {
            AcademicYearResponseDto activeAcademicYear = academicYearService.getActiveAcademicYear();
            if (activeAcademicYear == null) {
                return new AverageMarksBySubjectDto(
                    new ArrayList<>(),
                    new AverageMarksBySubjectDto.SubjectLevelData("Nursery", new ArrayList<>()),
                    new AverageMarksBySubjectDto.SubjectLevelData("Primary", new ArrayList<>()),
                    "No Active Year",
                    "N/A"
                );
            }

            List<Object[]> results = gradeRepository.findAverageMarksBySubject(activeAcademicYear.getAcademicYearId());

            Map<String, Map<String, Double>> subjectData = new HashMap<>();
            Set<String> allSubjects = new TreeSet<>();

            for (Object[] row : results) {
                String subject = (String) row[0];
                ESchoolLevel level = (ESchoolLevel) row[1];
                Number avgMark = (Number) row[2];

                allSubjects.add(subject);

                String levelKey = level == ESchoolLevel.NURSERY ? "Nursery" : "Primary";

                subjectData.computeIfAbsent(subject, k -> new HashMap<>())
                          .put(levelKey, avgMark != null ? avgMark.doubleValue() : 0.0);
            }

            if (allSubjects.isEmpty()) {
                return new AverageMarksBySubjectDto(
                    new ArrayList<>(),
                    new AverageMarksBySubjectDto.SubjectLevelData("Nursery", new ArrayList<>()),
                    new AverageMarksBySubjectDto.SubjectLevelData("Primary", new ArrayList<>()),
                    activeAcademicYear.getFiscalYear(),
                    "Term 1"
                );
            }

            List<String> subjectsList = new ArrayList<>(allSubjects);

            List<Double> nurseryMarks = subjectsList.stream()
                .map(subject -> subjectData.getOrDefault(subject, new HashMap<>()).getOrDefault("Nursery", 0.0))
                .collect(Collectors.toList());

            List<Double> primaryMarks = subjectsList.stream()
                .map(subject -> subjectData.getOrDefault(subject, new HashMap<>()).getOrDefault("Primary", 0.0))
                .collect(Collectors.toList());

            return new AverageMarksBySubjectDto(
                subjectsList,
                new AverageMarksBySubjectDto.SubjectLevelData("Nursery", nurseryMarks),
                new AverageMarksBySubjectDto.SubjectLevelData("Primary", primaryMarks),
                activeAcademicYear.getFiscalYear(),
                "Term 1"
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new AverageMarksBySubjectDto(
                new ArrayList<>(),
                new AverageMarksBySubjectDto.SubjectLevelData("Nursery", new ArrayList<>()),
                new AverageMarksBySubjectDto.SubjectLevelData("Primary", new ArrayList<>()),
                "Error",
                "N/A"
            );
        }
    }

    @Override
    public MarksSubmissionTrendsDto getMarksSubmissionTrends() {
        try {
            List<Object[]> results = gradeRepository.findMarksSubmissionTrends();

            Map<String, Map<String, Map<String, Integer>>> trendsData = new TreeMap<>(Collections.reverseOrder());
            Set<String> academicYears = new TreeSet<>(Collections.reverseOrder());

            for (Object[] row : results) {
                String academicYear = (String) row[0];
                ETerm term = (ETerm) row[1];
                String status = row[2] != null ? row[2].toString() : "UNKNOWN";
                Number count = (Number) row[3];

                academicYears.add(academicYear);

                String termKey = term.name();

                trendsData.computeIfAbsent(academicYear, k -> new TreeMap<>())
                          .computeIfAbsent(termKey, k -> new HashMap<>())
                          .put(status, count.intValue());
            }

            Set<String> allTerms = new TreeSet<>();
            for (Map<String, Map<String, Integer>> yearData : trendsData.values()) {
                allTerms.addAll(yearData.keySet());
            }
            List<String> termsList = new ArrayList<>(allTerms);

            Map<String, MarksSubmissionTrendsDto.TermData> trendsByYear = new HashMap<>();

            for (String year : academicYears) {
                Map<String, Map<String, Integer>> yearData = trendsData.get(year);

                List<Integer> approved = new ArrayList<>();
                List<Integer> submitted = new ArrayList<>();
                List<Integer> pending = new ArrayList<>();
                List<Integer> rejected = new ArrayList<>();

                for (String term : termsList) {
                    Map<String, Integer> termData = yearData.getOrDefault(term, new HashMap<>());
                    approved.add(termData.getOrDefault("APPROVED", 0));
                    submitted.add(termData.getOrDefault("SUBMITTED", 0));
                    pending.add(termData.getOrDefault("DRAFT", 0));
                    rejected.add(termData.getOrDefault("REJECTED", 0));
                }

                trendsByYear.put(year, new MarksSubmissionTrendsDto.TermData(approved, submitted, pending, rejected));
            }

            return new MarksSubmissionTrendsDto(
                new ArrayList<>(academicYears),
                termsList,
                trendsByYear
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new MarksSubmissionTrendsDto(new ArrayList<>(), new ArrayList<>(), new HashMap<>());
        }
    }

    @Override
    public GradeDistributionDto getGradeDistribution() {
        try {
            AcademicYearResponseDto activeAcademicYear = academicYearService.getActiveAcademicYear();
            if (activeAcademicYear == null) {
                return new GradeDistributionDto(new ArrayList<>(), "No Active Year", "N/A");
            }

            List<Object[]> results = gradeRepository.findGradeDistribution(activeAcademicYear.getAcademicYearId());

            List<GradeDistributionDto.ClassGradeData> classData = new ArrayList<>();

            for (Object[] row : results) {
                String className = (String) row[0];
                Number a1 = (Number) row[1];
                Number b2 = (Number) row[2];
                Number b3 = (Number) row[3];
                Number c4 = (Number) row[4];
                Number d = (Number) row[5];
                Number total = (Number) row[6];

                classData.add(new GradeDistributionDto.ClassGradeData(
                    className,
                    a1 != null ? a1.intValue() : 0,
                    b2 != null ? b2.intValue() : 0,
                    b3 != null ? b3.intValue() : 0,
                    c4 != null ? c4.intValue() : 0,
                    d != null ? d.intValue() : 0,
                    total != null ? total.intValue() : 0
                ));
            }

            return new GradeDistributionDto(classData, activeAcademicYear.getFiscalYear(), "Term 1");
        } catch (Exception e) {
            e.printStackTrace();
            return new GradeDistributionDto(new ArrayList<>(), "Error", "N/A");
        }
    }
}
