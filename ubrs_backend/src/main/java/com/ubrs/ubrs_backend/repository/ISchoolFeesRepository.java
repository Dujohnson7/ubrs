package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.SchoolFees;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ISchoolFeesRepository extends JpaRepository<SchoolFees, UUID> {
    Optional<SchoolFees> findSchoolFeesByIdAndIsDeleted(UUID id, Boolean isDeleted);
    List<SchoolFees> findAllByIsDeleted(Boolean isDeleted);
    boolean existsByAcademicYear_IdAndIsDeleted(UUID academicYearId, Boolean isDeleted);
}
