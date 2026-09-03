package com.ubrs.ubrs_backend.domain.dto.classAssignment;

import com.ubrs.ubrs_backend.util.EAssignmentState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class ClassAssignmentResponseDto {

    private UUID id;

    private UUID teacherId;

    private String teacherName;

    private UUID schoolClassId;

    private String schoolClassName;

    private UUID courseId;

    private String courseName;

    private EAssignmentState assignmentStatus;

    private LocalDate assignmentDate;

    private LocalDate closedDate;
}