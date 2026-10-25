package com.ubrs.ubrs_backend.repository;

 import com.ubrs.ubrs_backend.domain.entity.OtherIncome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

 import java.util.List;
 import java.util.Optional;
import java.util.UUID;

@Repository
public interface IOtherIncomeRepository extends JpaRepository<OtherIncome, UUID> {
    Optional<OtherIncome> findOtherIncomeByIdAndIsDeleted(UUID id, Boolean isDeleted);
    List<OtherIncome> findAllByIsDeleted(Boolean isDeleted);
}
