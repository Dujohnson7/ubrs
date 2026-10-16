package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.ExpensesPayments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IExpensesPaymentsRepository extends JpaRepository<ExpensesPayments, UUID> {
    Optional<ExpensesPayments> findExpensesPaymentsByIdAndIsDeleted(UUID id, Boolean isDeleted);
    List<ExpensesPayments> findAllByIsDeleted(Boolean isDeleted);
    List<ExpensesPayments> findAllBySchoolExpense_IdAndIsDeleted(UUID schoolExpenseId, Boolean isDeleted);

}
