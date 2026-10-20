package com.ubrs.ubrs_backend.domain.entity;

import com.ubrs.ubrs_backend.domain.base.AbstractBaseEntity;
import com.ubrs.ubrs_backend.util.EReminderState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class Announcement extends AbstractBaseEntity {
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EReminderState reminderState;

    private LocalDateTime activeTime;

    private LocalDateTime expireTime;
}
