package com.ubrs.ubrs_backend.domain.dto.parent;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class ParentStudentResponseDto {
    private UUID id;
 
    private UUID parentId;
    private String parentName;
    private String parentEmail;
    private String parentPhone;

    private UUID studentId;
    private String studentCode;
    private String studentName;

    private UUID schoolClassId;
    private String schoolClassName;
    private String classLevel;
}
