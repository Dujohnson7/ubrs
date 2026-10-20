package com.ubrs.ubrs_backend.repository;

import com.ubrs.ubrs_backend.domain.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;

@Repository
public interface IAnnouncementRepository extends JpaRepository<Announcement, UUID> {
    Optional<Announcement>  findAnnouncementById(UUID id);
}
