package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class Course extends AbstractBaseEntity {

    @Column(length = 100)
    private String courseCode;

    @Column(length = 100)
    private String courseName;

    private int courseHours;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private ESchoolLevel courseLevel;
}
