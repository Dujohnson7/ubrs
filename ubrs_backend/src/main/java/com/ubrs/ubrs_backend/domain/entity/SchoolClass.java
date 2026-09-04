package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class SchoolClass extends AbstractBaseEntity {

    @Column(length = 100)
    private String name;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private ESchoolLevel classLevel;

    @ManyToOne
    @JoinColumn(name = "classTeacherId", nullable = false)
    private Users classTeacher;
}
