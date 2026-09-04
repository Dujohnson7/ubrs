package com.ubrs.ubrs_backend.domain.projection.grade;

import com.ubrs.ubrs_backend.util.EGradeState;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public interface ClassGradeDetailProjection {

    UUID getCourseId();

    String getSubject();

    String getTeacher();

    Long getStudents();

    BigDecimal getTest();

    BigDecimal getExam();

    LocalDateTime getSubmittedAt();

    EGradeState getStatus();
}
