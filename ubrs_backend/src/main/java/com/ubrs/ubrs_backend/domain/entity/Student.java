package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EGender;
import com.ubrs.ubrs_backend.util.EStudentState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
public class Student extends AbstractBaseEntity {

    @Column(length = 30, nullable = false, unique = true)
    private String studentCode;

    @Column(length = 100, nullable = false)
    private String firstName;

    @Column(length = 50)
    private String middleName;

    @Column(length = 100, nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private EGender gender;

    private LocalDate dateOfBirth;

    @Column(length = 100)
    private String fatherName;

    @Column(length = 13)
    private String fatherPhone;

    @Column(length = 100)
    private String motherName;

    @Column(length = 13)
    private String motherPhone;

    @Column(length = 100)
    private String guardianName;

    @Column(length = 13)
    private String guardianPhone;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private EStudentState  studentStatus;

    @ManyToOne
    @JoinColumn(name = "schoolClass_Id")
    private SchoolClass schoolClass;
}
