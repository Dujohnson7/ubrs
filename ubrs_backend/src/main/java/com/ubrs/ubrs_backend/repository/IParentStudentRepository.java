package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IParentStudentRepository extends JpaRepository<ParentStudent, UUID> {

    boolean existsByParent_IdAndStudent_Id(UUID parentId, UUID studentId);

    List<ParentStudent> findAllByParent_Id(UUID parentId);

    List<ParentStudent> findAllByStudent_Id(UUID studentId);
}
