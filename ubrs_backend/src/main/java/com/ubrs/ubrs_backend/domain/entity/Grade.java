package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EGradeState;
import com.ubrs.ubrs_backend.util.ETerm;
import com.ubrs.ubrs_backend.util.GradeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
public class Grade extends AbstractBaseEntity {

    @ManyToOne
    @JoinColumn(name = "academicYearId")
    private AcademicYear academicYear;

    @Column(length = 5)
    @Enumerated(EnumType.STRING)
    private ETerm term;

    @ManyToOne
    @JoinColumn(name = "schoolClassId")
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "courseId")
    private Course course;

    @Column(length = 6)
    @Enumerated(EnumType.STRING)
    private GradeType gradeType;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal maxMark;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private EGradeState submitStatus;


    @ManyToOne
    @JoinColumn(name = "teacherId")
    private Users teacher;

    @ManyToOne
    @JoinColumn(name = "submittedBy")
    private Users submittedBy;

    @ManyToOne
    @JoinColumn(name = "approvedBy")
    private Users approvedBy;

    @ManyToOne
    @JoinColumn(name = "rejectedBy")
    private Users rejectedBy;

    private String feedback;

    @OneToMany(mappedBy = "grade",  cascade = CascadeType.ALL,  orphanRemoval = true)
    List<GradeDetails> gradeDetails =  new ArrayList<>();
}
