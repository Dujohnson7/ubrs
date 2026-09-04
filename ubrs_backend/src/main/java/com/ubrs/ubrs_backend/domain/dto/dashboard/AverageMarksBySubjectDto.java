package com.ubrs.ubrs_backend.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AverageMarksBySubjectDto {
    private List<String> subjects;
    private SubjectLevelData nursery;
    private SubjectLevelData primary;
    private String academicYear;
    private String term;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectLevelData {
        private String name;
        private List<Double> averageMarks;
    }
}
