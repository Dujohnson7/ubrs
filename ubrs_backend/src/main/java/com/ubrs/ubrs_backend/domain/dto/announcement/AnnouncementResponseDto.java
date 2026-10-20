package com.ubrs.ubrs_backend.domain.dto.announcement;

import com.ubrs.ubrs_backend.util.EReminderState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class AnnouncementResponseDto {
    private UUID announcementId;
    private String message;
    private EReminderState reminderState;
    private LocalDateTime activeTime;
    private LocalDateTime expireTime;
}
