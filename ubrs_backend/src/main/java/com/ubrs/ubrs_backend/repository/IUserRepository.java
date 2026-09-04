package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Users;
import com.ubrs.ubrs_backend.util.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<Users, UUID> {
    Optional<Users> findUsersByEmailAndUserStatusAndIsDeleted(String email, boolean userStatus, Boolean isDeleted);

    Optional<Users> findUsersByIdAndIsDeleted(UUID id, Boolean isDeleted);

    Optional<Users> findUsersByEmailAndIsDeleted(String email, Boolean isDeleted);

    List<Users> findAllByIsDeleted(Boolean isDeleted);

    @Query("SELECT t FROM Users t WHERE t.role IN('TEAACHER','CLASSTEACHER') AND t.isDeleted = false")
    List<Users> findAllTeacher();

    List<Users> findAllByRoleAndIsDeleted(ERole role, Boolean isDeleted);

    boolean existsUsersByEmailAndIsDeleted(String email, Boolean isDeleted);

    long countAllByRoleAndIsDeleted(ERole role, Boolean isDeleted);

    long countAllByRoleAndUserStatusAndIsDeleted(ERole role, boolean userStatus, Boolean isDeleted);

    long countAllByRoleInAndUserStatusAndIsDeleted(List<ERole> roles, boolean userStatus, Boolean isDeleted);
}
