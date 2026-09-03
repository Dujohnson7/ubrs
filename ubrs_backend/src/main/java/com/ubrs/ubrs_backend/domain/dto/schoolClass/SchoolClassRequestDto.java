package com.ubrs.ubrs_backend.domain.dto.schoolClass;

import com.ubrs.ubrs_backend.util.ESchoolLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class SchoolClassRequest {

    private String name;

    private ESchoolLevel classLevel;

    private UUID classTeacherId;
}