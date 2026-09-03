package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EAssignmentState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
public class ClassAssignment extends AbstractBaseEntity {

    @ManyToOne
    @JoinColumn(name = "teacherId")
    private Users teacher;

    @ManyToOne
    @JoinColumn(name = "schoolClassId")
    private SchoolClass  schoolClass;

    @ManyToOne
    @JoinColumn(name = "courseId")
    private Course  course;

    @Column(length = 6)
    @Enumerated(EnumType.STRING)
    private EAssignmentState assignmentStatus;

    private LocalDate assignmentDate;

    private LocalDate closedDate;
}
