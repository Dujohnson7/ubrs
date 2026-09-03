package com.ubrs.ubrs_backend.domain.dto.classAssignment;

import com.ubrs.ubrs_backend.util.EAssignmentState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class ClassAssignmentRequestDto {

    private UUID teacherId;

    private UUID schoolClassId;

    private UUID courseId;

    private EAssignmentState assignmentStatus;

    private LocalDate assignmentDate;

    private LocalDate closedDate;
}