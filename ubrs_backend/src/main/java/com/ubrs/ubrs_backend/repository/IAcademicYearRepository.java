package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.AcademicYear;
import com.ubrs.ubrs_backend.util.EAcademicState;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IAcademicYearRepository extends CrudRepository<AcademicYear, UUID> {
    Optional<AcademicYear> findAcademicYearByIdAndIsDeleted(UUID id, Boolean isDeleted);
    Optional<AcademicYear> findAcademicYearByAcademicYearStatusAndIsDeleted(EAcademicState academicYearStatus, Boolean isDeleted);
    List<AcademicYear> findAllByIsDeleted(Boolean isDeleted);
    long countAllByIsDeleted(Boolean isDeleted);
    long countAllByAcademicYearStatusInAndIsDeleted(List<EAcademicState> academicYearStatus, Boolean isDeleted);
}
