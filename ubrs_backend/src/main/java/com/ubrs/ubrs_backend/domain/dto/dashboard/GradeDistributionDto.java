package com.ubrs.ubrs_backend.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDistributionDto {
    private List<ClassGradeData> classData;
    private String academicYear;
    private String term;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassGradeData {
        private String className;
        private int a1;
        private int b2;
        private int b3;
        private int c4;
        private int d;
        private int total;
    }
}
