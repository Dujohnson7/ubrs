package com.ubrs.ubrs_backend.repository.users;

import com.ubrs.ubrs_backend.domain.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<Users, UUID> {
    Optional<Users> findUsersByEmailAndUserStatusAndIsDeleted(String email, boolean userStatus, boolean isDeleted);
}
