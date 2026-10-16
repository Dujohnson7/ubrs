package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.SchoolExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ISchoolExpenseRepository  extends JpaRepository<SchoolExpense, UUID> {
    Optional<SchoolExpense> findSchoolExpenseByIdAndIsDeleted(UUID id, Boolean isDeleted);
    List<SchoolExpense> findAllByIsDeleted(Boolean isDeleted);
    List<SchoolExpense> findAllByExpenseStausAndIsDeleted(Boolean expenseStaus, Boolean isDeleted);
    long countAllByExpenseStausAndIsDeleted(Boolean expenseStaus, Boolean isDeleted);
    boolean existsByExpenseNameIgnoreCaseAndIsDeleted(String expenseName, Boolean isDeleted);
}
