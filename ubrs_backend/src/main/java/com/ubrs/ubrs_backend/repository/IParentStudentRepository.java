package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.ParentStudent;
import com.ubrs.ubrs_backend.domain.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface IParentStudentRepository extends JpaRepository<ParentStudent, UUID> {

    boolean existsByParent_IdAndStudent_Id(UUID parentId, UUID studentId);

    List<ParentStudent> findAllByParent_Id(UUID parentId);

    List<ParentStudent> findAllByParent_IdAndIsDeleted(UUID parentId, Boolean isDeleted);

    List<ParentStudent> findAllByIsDeleted(Boolean isDeleted);

    @Query("SELECT DISTINCT ps.parent FROM ParentStudent ps WHERE ps.isDeleted = false ")
    List<Users> findAllParentsByIsDeleted();

    List<ParentStudent> findAllByStudent_Id(UUID studentId);
}
