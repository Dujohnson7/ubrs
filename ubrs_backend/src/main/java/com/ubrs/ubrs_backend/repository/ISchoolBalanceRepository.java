package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.SchoolBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ISchoolBalanceRepository extends JpaRepository<SchoolBalance, UUID> {
    Optional<SchoolBalance> findFirstBy();
}
