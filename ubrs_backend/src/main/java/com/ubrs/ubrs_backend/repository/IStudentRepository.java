package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Student;
import com.ubrs.ubrs_backend.util.ESchoolLevel;
import com.ubrs.ubrs_backend.util.EStudentState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IStudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findStudentByIdAndIsDeleted(UUID id, Boolean isDeleted);

    Optional<Student> findStudentByStudentCodeAndIsDeleted(String studentCode, Boolean isDeleted);

    boolean existsByStudentCodeAndIsDeleted(String studentCode, Boolean isDeleted);

    Optional<Student> findStudentByIdAndStudentStatusAndIsDeleted(UUID id, EStudentState studentStatus, Boolean isDeleted);

    List<Student> findAllByIsDeleted(Boolean isDeleted);

    List<Student> findAllBySchoolClass_ClassTeacher_IdAndStudentStatusAndIsDeleted(UUID schoolClassClassTeacherId, EStudentState studentStatus, Boolean isDeleted);

    List<Student> findAllBySchoolClass_IdAndIsDeleted(UUID schoolClassId, Boolean isDeleted);

    List<Student> findStudentBySchoolClass_ClassLevelAndIsDeleted(ESchoolLevel schoolClassClassLevel, Boolean isDeleted);

    boolean existsBySchoolClass_IdAndIsDeleted(UUID schoolClassId, Boolean isDeleted);

    long countAllByStudentStatusAndIsDeleted(EStudentState studentStatus, Boolean isDeleted);

    long countAllBySchoolClass_ClassLevelAndStudentStatusAndIsDeleted(ESchoolLevel schoolClassClassLevel, EStudentState studentStatus, Boolean isDeleted);

    long countAllBySchoolClass_IdAndStudentStatusAndIsDeleted(UUID schoolClassId, EStudentState studentStatus, Boolean isDeleted);
            
}
