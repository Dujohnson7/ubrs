package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.SchoolClass;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ISchoolClassRepository extends JpaRepository<SchoolClass, UUID> {

    long countAllByIsDeleted(Boolean isDeleted);

    SchoolClass findSchoolClassByClassTeacher_IdAndIsDeleted(UUID classTeacherId, Boolean isDeleted);

    Optional<SchoolClass> findSchoolClassByIdAndIsDeleted(UUID id, Boolean isDeleted);

    List<SchoolClass> findAllByIsDeleted(Boolean isDeleted);

    List<SchoolClass> findAllByClassLevelAndIsDeleted(ESchoolLevel classLevel, Boolean isDeleted);
}
