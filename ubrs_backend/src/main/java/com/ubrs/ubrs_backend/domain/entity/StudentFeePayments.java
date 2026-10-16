package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EPaymentState;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.ETerm;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
public class StudentFeePayments extends AbstractBaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_Id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolFees_Id", nullable = false)
    private SchoolFees schoolFees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ETerm term;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ESchoolLevel studentLevel;

    private Double totalAmountPaid;

    private Double remainAmount;

    @Column(nullable = false, columnDefinition = "double precision  default 0.0")
    private double overDueAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EPaymentState paymentStatus;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isOverDueBeUsed;

    @OneToMany(mappedBy = "studentFeePayments",  cascade = CascadeType.ALL,  orphanRemoval = true)
    List<StudentFeePaymentsDetail> studentFeePaymentsDetails =  new ArrayList<>();
}
