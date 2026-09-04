package com.ubrs.ubrs_backend.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarksSubmissionTrendsDto {
    private List<String> academicYears;
    private List<String> terms;
    private Map<String, TermData> trendsByYear;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TermData {
        private List<Integer> approved;
        private List<Integer> submitted;
        private List<Integer> pending;
        private List<Integer> rejected;
    }
}
