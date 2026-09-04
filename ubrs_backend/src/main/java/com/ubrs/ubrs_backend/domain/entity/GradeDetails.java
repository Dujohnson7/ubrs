package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@Entity
public class GradeDetails  extends AbstractBaseEntity {

    @ManyToOne
    @JoinColumn(name = "gradeId")
    private Grade grade;

    @ManyToOne
    @JoinColumn(name = "studentId")
    private Student student;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal mark;

}
