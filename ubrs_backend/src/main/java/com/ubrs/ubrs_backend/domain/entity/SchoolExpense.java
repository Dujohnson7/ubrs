package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class SchoolExpense  extends AbstractBaseEntity {
    @Column(length = 100)
    private String expenseName;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean expenseStaus;
}
