package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
public class ExpensesPayments extends AbstractBaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolExpense_Id", nullable = false)
    private SchoolExpense schoolExpense;

    private Double amount;

    private LocalDate expenseDate;
}
