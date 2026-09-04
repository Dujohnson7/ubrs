package com.ubrs.ubrs_backend.domain.dto.student;

import com.ubrs.ubrs_backend.util.EGender;
import com.ubrs.ubrs_backend.util.EStudentState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class StudentResponseDto {

    private UUID studentId;

    private String studentCode;

    private String firstName;

    private String middleName;

    private String lastName;

    private EGender gender;

    private LocalDate dateOfBirth;

    private String fatherName;

    private String fatherPhone;

    private String motherName;

    private String motherPhone;

    private String guardianName;

    private String guardianPhone;

    private EStudentState studentStatus;

    private UUID schoolClassId;

    private String schoolClassName;
}