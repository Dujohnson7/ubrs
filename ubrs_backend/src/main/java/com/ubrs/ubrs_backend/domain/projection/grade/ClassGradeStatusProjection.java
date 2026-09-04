package com.ubrs.ubrs_backend.domain.projection;

import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;

import java.util.UUID;

public interface ClassGradeStatusProjection {

    UUID getClassId();

    String getClassName();

    ESchoolLevel getLevel();

    String getClassTeacher();

    ETerm getTerm();

    Long getSubjects();

    Long getApproved();

    String getStatus();
}
