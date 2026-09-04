package com.ubrs.ubrs_backend.domain.projection.grade;

import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;

import java.util.UUID;

public interface ClassGradeStatusProjection {

    UUID getClassId();

    String getClassName();

    ESchoolLevel getClassLevel();

    String getClassTeacher();

    UUID getAcademicYearId();

    String getAcademicYear();

    ETerm getTerm();

    Long getSubjects();

    Long getApproved();

    String getStatus();
}
