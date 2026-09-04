package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EAcademicState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class AcademicYear extends AbstractBaseEntity {
    @Column(length = 100)
    private String fiscalYear;

    @Enumerated(EnumType.STRING)
    private EAcademicState academicYearStatus =  EAcademicState.PENDING;
}
