package com.ubrs.ubrs_backend.domain.dto.course;

import com.ubrs.ubrs_backend.util.ESchoolLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class CourseResponseDto {

    private UUID courseId;

    private String courseCode;

    private String courseName;

    private int courseHours;

    private ESchoolLevel courseLevel;
}