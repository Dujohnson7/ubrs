package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class SchoolFees extends AbstractBaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academicYear_id", nullable = false)
    private AcademicYear academicYear;

    private Double nurseryFees;

    private Double primaryFees;
}
